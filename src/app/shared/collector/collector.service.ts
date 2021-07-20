import { Injectable } from '@angular/core';
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
import { SignatureProvider } from './signature/signature-provider';

@Injectable({
  providedIn: 'root',
})
export class CollectorService {
  private readonly factsProviders = new Set<FactsProvider>();
  private readonly signatureProviders = new Set<SignatureProvider>();

  constructor(private readonly mediaStore: MediaStore) {}

  async run(assets: Assets, capturedTimestamp: number) {
    const truth = await this.collectTruth(assets, capturedTimestamp);
    const proof = await Proof.from(this.mediaStore, assets, truth);
    const signedMessage = await proof.generateSignedMessage();
    const signatures = await this.signMessage(signedMessage);
    proof.setSignatures(signatures);
    proof.isCollected = true;
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

  private async signMessage(message: SignedMessage): Promise<Signatures> {
    const serializedSortedSignedMessage = getSerializedSortedSignedMessage(
      message
    );
    return Object.fromEntries(
      await Promise.all(
        [...this.signatureProviders].map(async provider => [
          provider.id,
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
