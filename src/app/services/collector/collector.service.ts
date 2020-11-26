import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { sortObjectDeeplyByKey } from '../../utils/immutable/immutable';
import { NotificationService } from '../notification/notification.service';
import {
  Assets,
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
    private readonly proofRepository: ProofRepository
  ) {}

  async runAndStore(assets: Assets) {
    const notificationId = this.notificationService.createNotificationId();
    this.notificationService.notify(
      notificationId,
      this.translocoService.translate('collectingProof'),
      this.translocoService.translate('collectingInformation')
    );
    const truth = await this.collectTruth(assets);
    const signatures = await this.signTargets({ assets, truth });
    const proof = new Proof(assets, truth, signatures);
    await this.proofRepository.add(proof);
    return proof;
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

  private async signTargets(target: SignedTargets): Promise<Signatures> {
    const serializedSortedSignTargets = JSON.stringify(
      sortObjectDeeplyByKey(target as any).toJSON()
    );
    return Object.fromEntries(
      await Promise.all(
        [...this.signatureProviders].map(async provider => [
          provider.id,
          await provider.provide(serializedSortedSignTargets),
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
