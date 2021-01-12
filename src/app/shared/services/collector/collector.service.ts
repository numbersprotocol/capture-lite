import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { defer } from 'rxjs';
import { ImageStore } from '../image-store/image-store.service';
import { NotificationService } from '../notification/notification.service';
import {
  Assets,
  getSerializedSortedSignedTargets,
  Proof,
  Signatures,
  SignedTargets,
  Truth,
} from '../repositories/proof/proof';
import { ProofRepository } from '../repositories/proof/proof-repository.service';
import { FactsProvider } from './facts/facts-provider';
import { SignatureProvider } from './signature/signature-provider';

@Injectable({
  providedIn: 'root',
})
export class CollectorService {
  private readonly factsProviders = new Set<FactsProvider>();
  private readonly signatureProviders = new Set<SignatureProvider>();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly translocoService: TranslocoService,
    private readonly proofRepository: ProofRepository,
    private readonly imageStore: ImageStore
  ) {}

  async run(assets: Assets) {
    return this.notificationService.notifyOnGoing(
      defer(() => this._run(assets)),
      this.translocoService.translate('storingAssets'),
      this.translocoService.translate('message.storingAssets'),
      true
    );
  }

  private async _run(assets: Assets) {
    const truth = await this.collectTruth(assets);
    const signatures = await this.signTargets({ assets, truth });
    return Proof.from(this.imageStore, assets, truth, signatures);
  }

  private async collectTruth(assets: Assets): Promise<Truth> {
    return {
      timestamp: Date.now(),
      providers: Object.fromEntries(
        await Promise.all(
          [...this.factsProviders].map(async provider => [
            provider.id,
            await provider.provide(assets),
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
