import { Injectable } from '@angular/core';
import { sha256WithBase64 } from '../../utils/crypto/crypto';
import { MediaStore } from '../media/media-store/media-store.service';
import {
  Assets,
  getSerializedSortedSignedTargets,
  IndexedAssets,
  Proof,
  Signatures,
  SignedTargets,
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
    const [base64, assetMeta] = Object.entries(assets)[0];
    const indexedAssets: IndexedAssets = Object.fromEntries([
      [await sha256WithBase64(base64), assetMeta],
    ]);
    const signatures = await this.signTargets({ indexedAssets, truth });
    const proof = await Proof.from(this.mediaStore, assets, truth, signatures);
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

  private async signTargets(targets: SignedTargets): Promise<Signatures> {
    const serializedSortedSignedTargets = getSerializedSortedSignedTargets(
      targets
    );
    return Object.fromEntries(
      await Promise.all(
        [...this.signatureProviders].map(async provider => [
          provider.id,
          await provider.provide(serializedSortedSignedTargets),
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
