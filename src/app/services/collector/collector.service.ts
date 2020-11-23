import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { EMPTY } from 'rxjs';
import { catchError, concatMap, map, mapTo, pluck, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { fileNameWithoutExtension } from 'src/app/utils/file/file';
import { sortObjectDeeplyByKey } from 'src/app/utils/immutable/immutable';
import { MimeType } from 'src/app/utils/mime-type';
import { forkJoinWithDefault } from 'src/app/utils/rx-operators';
import { NotificationService } from '../notification/notification.service';
import { PublishersAlert } from '../publisher/publishers-alert/publishers-alert.service';
import { OldProof } from '../repositories/proof/old-proof-adapter';
import { OldProofRepository } from '../repositories/proof/old-proof-repository.service';
import { Assets, Proof, Signatures, SignedTargets, Truth } from '../repositories/proof/proof';
import { ProofRepository } from '../repositories/proof/proof-repository.service';
import { FactsProvider, OldInformationProvider } from './information/information-provider';
import { OldSignatureProvider, SignatureProvider } from './signature/signature-provider';

@Injectable({
  providedIn: 'root'
})
export class CollectorService {

  private readonly oldInformationProviders = new Set<OldInformationProvider>();
  private readonly oldSignatureProviders = new Set<OldSignatureProvider>();
  private readonly factsProviders = new Set<FactsProvider>();
  private readonly signatureProviders = new Set<SignatureProvider>();

  constructor(
    private readonly oldProofRepository: OldProofRepository,
    private readonly notificationService: NotificationService,
    private readonly translocoService: TranslocoService,
    private readonly publishersAlert: PublishersAlert,
    private readonly proofRepository: ProofRepository
  ) { }

  storeAndCollect(rawBase64: string, mimeType: MimeType) {
    // Deliberately subscribe without untilDestroyed scope. Also, it is not feasible to use
    // subsctibeInBackground() as it will move the execution out of ngZone, which will prevent
    // the observables subscribed with async pipe from observing new values.
    this.store$(rawBase64, mimeType).pipe(
      concatMap(proof => this.collectAndSign$(proof)),
      concatMap(proof => this.publishersAlert.presentOrPublish$(proof))
    ).subscribe();
  }

  private store$(rawBase64: string, mimeType: MimeType) {
    return this.oldProofRepository.saveRawFile$(rawBase64, mimeType).pipe(
      // Get the proof hash from the uri.
      map(uri => fileNameWithoutExtension(uri)),
      // Store the media file.
      switchMap(hash => this.oldProofRepository.add$({ hash, mimeType, timestamp: Date.now() })),
      pluck(0)
    );
  }

  private collectAndSign$(proof: OldProof) {
    const notificationId = this.notificationService.createNotificationId();
    this.notificationService.notify(
      notificationId,
      this.translocoService.translate('collectingProof'),
      this.translocoService.translate('collectingInformation')
    );
    return forkJoinWithDefault([...this.oldInformationProviders].map(provider => provider.collectAndStore$(proof))).pipe(
      tap(_ => this.notificationService.notify(
        notificationId,
        this.translocoService.translate('collectingProof'),
        this.translocoService.translate('signingProof')
      )),
      switchMapTo(forkJoinWithDefault([...this.oldSignatureProviders].map(provider => provider.signAndStore$(proof)))),
      tap(_ => this.notificationService.cancel(notificationId)),
      catchError(error => {
        this.notificationService.notifyError(notificationId, error);
        return EMPTY;
      }),
      mapTo(proof)
    );
  }

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
    this.proofRepository.add(proof);
    return proof;
  }

  private async collectTruth(assets: Assets): Promise<Truth> {
    return {
      timestamp: Date.now(),
      providers: Object.fromEntries(
        await Promise.all([...this.factsProviders].map(
          async (provider) => [provider.id, await provider.provide(assets)]
        ))
      )
    };
  }

  private async signTargets(target: SignedTargets): Promise<Signatures> {
    const serializedSortedSignTargets = JSON.stringify(sortObjectDeeplyByKey(target as any).toJSON());
    return Object.fromEntries(
      await Promise.all([...this.signatureProviders].map(
        async (provider) => [provider.id, await provider.provide(serializedSortedSignTargets)]
      ))
    );
  }

  addFactsProvider(provider: FactsProvider) { this.factsProviders.add(provider); }

  removeFactsProvider(provider: FactsProvider) { this.factsProviders.delete(provider); }

  addSignatureProvider(provider: SignatureProvider) { this.signatureProviders.add(provider); }

  removeSignatureProvider(provider: SignatureProvider) { this.signatureProviders.delete(provider); }

  oldAddInformationProvider(...providers: OldInformationProvider[]) {
    providers.forEach(provider => this.oldInformationProviders.add(provider));
  }

  oldRemoveInformationProvider(...providers: OldInformationProvider[]) {
    providers.forEach(provider => this.oldInformationProviders.delete(provider));
  }

  oldAddSignatureProvider(...providers: OldSignatureProvider[]) {
    providers.forEach(provider => this.oldSignatureProviders.add(provider));
  }

  oldRemoveSignatureProvider(...providers: OldSignatureProvider[]) {
    providers.forEach(provider => this.oldSignatureProviders.delete(provider));
  }
}
