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
    proof.cameraSource = source;
    await this.generateSignature(proof, proof.cameraSource);
    proof.isCollected = true;
    return proof;
  }

  // FIXME: @sultanmyrza get cameraSource from proof.cameraSource instead of passing separately
  // TODO: @sultanmyrza remove 2nd parameter and make sure all other places get called accordinglyt
  async generateSignature(proof: Proof, source: CameraSource) {
    const recorder = CaptureAppWebCryptoApiSignatureProvider.recorderFor(
      proof.cameraSource
    );
    const proofMetadata = await proof.generateProofMetadata(recorder);
    const { signatures, integritySha } = await this.signProofMetadata(
      proofMetadata,
      source
    );
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
