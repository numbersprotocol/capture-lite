import { Injectable } from '@angular/core';
import { CameraSource } from '@capacitor/camera';
import { generateIntegritySha } from '../../utils/nit/nit';
import { MediaStore } from '../media/media-store/media-store.service';
import {
  Assets,
  Proof,
  ProofMetadata,
  SignResult,
  Truth,
  getSerializedSortedProofMetadata,
} from '../repositories/proof/proof';
import { FactsProvider } from './facts/facts-provider';
import { CaptureAppWebCryptoApiSignatureProvider } from './signature/capture-app-web-crypto-api-signature-provider/capture-app-web-crypto-api-signature-provider.service';
import { SignatureProvider } from './signature/signature-provider';

@Injectable({
  providedIn: 'root',
})
export class CollectorService {
  private readonly factsProviders = new Set<FactsProvider>();
  private readonly signatureProviders = new Set<SignatureProvider>();

  constructor(private readonly mediaStore: MediaStore) {}

  async run(assets: Assets, capturedTimestamp: number, source: CameraSource) {
    const truth = await this.collectTruth(assets, capturedTimestamp);
    const proof = await Proof.from(this.mediaStore, assets, truth);
    await this.generateSignature(proof, source);
    proof.isCollected = true;
    return proof;
  }

  async generateSignature(proof: Proof, source: CameraSource) {
    const recorder =
      CaptureAppWebCryptoApiSignatureProvider.recorderFor(source);
    const proofMetadata = await proof.generateProofMetadata(recorder);
    const { signatures, integritySha } = await this.signProofMetadata(
      proofMetadata,
      source
    );
    console.log(
      'sign message ProofMetadata',
      await getSerializedSortedProofMetadata(proofMetadata)
    );
    console.log('generated signatures', signatures);
    console.log('generated integritySha', integritySha);
    proof.setSignatures(signatures);
    proof.setIntegritySha(integritySha);
    return proof;
  }

  private async collectTruth(
    assets: Assets,
    capturedTimestamp: number
  ): Promise<Truth> {
    return {
      timestamp: Date.now(),
      providers: Object.fromEntries(
        await Promise.all(
          [...this.factsProviders].map(async provider => [
            provider.id,
            await provider.provide(assets, capturedTimestamp),
          ])
        )
      ),
    };
  }

  private async signProofMetadata(
    proofMetadata: ProofMetadata,
    source: CameraSource
  ): Promise<SignResult> {
    const integritySha = await generateIntegritySha(proofMetadata);
    const signatures = Object.fromEntries(
      await Promise.all(
        [...this.signatureProviders].map(async provider => [
          provider.idFor(source),
          await provider.provide(integritySha),
        ])
      )
    );
    return { signatures, integritySha };
  }

  addFactsProvider(provider: FactsProvider) {
    this.factsProviders.add(provider);
  }

  removeFactsProvider(provider: FactsProvider) {
    this.factsProviders.delete(provider);
  }

  addSignatureProvider(provider: SignatureProvider) {
    this.signatureProviders.add(provider);
  }

  removeSignatureProvider(provider: SignatureProvider) {
    this.signatureProviders.delete(provider);
  }
}
