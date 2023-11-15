import { Injectable } from '@angular/core';
import { CameraSource } from '@capacitor/camera';
import { MediaStore } from '../media/media-store/media-store.service';
import {
  Assets,
  getSerializedSortedSignedMessage,
  Proof,
  Signatures,
  SignedMessage,
  Truth,
} from '../repositories/proof/proof';
import { FactsProvider } from './facts/facts-provider';
import { CaptureAppWebCryptoApiSignatureProvider } from './signature/capture-app-web-crypto-api-signature-provider/capture-app-web-crypto-api-signature-provider.service';
import { SignatureProvider } from './signature/signature-provider';
import { generateIntegritySha } from '../../utils/nit/nit';

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
    const signedMessage = await proof.generateSignedMessage(recorder);
    const signatures = await this.signMessage(signedMessage, source);
    proof.setSignatures(signatures);
    const integritySha = await generateIntegritySha(signedMessage);
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

  private async signMessage(
    message: SignedMessage,
    source: CameraSource
  ): Promise<Signatures> {
    const serializedSortedSignedMessage =
      getSerializedSortedSignedMessage(message);
    return Object.fromEntries(
      await Promise.all(
        [...this.signatureProviders].map(async provider => [
          provider.idFor(source),
          await provider.provide(serializedSortedSignedMessage),
        ])
      )
    );
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
