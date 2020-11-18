import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { EMPTY } from 'rxjs';
import { catchError, concatMap, map, mapTo, pluck, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { fileNameWithoutExtension } from 'src/app/utils/file/file';
import { MimeType } from 'src/app/utils/mime-type';
import { forkJoinWithDefault } from 'src/app/utils/rx-operators';
import { NotificationService } from '../notification/notification.service';
import { PublishersAlert } from '../publisher/publishers-alert/publishers-alert.service';
import { Proof } from '../repositories/proof/proof';
import { ProofRepository } from '../repositories/proof/proof-repository.service';
import { InformationProvider } from './information/information-provider';
import { SignatureProvider } from './signature/signature-provider';

@Injectable({
  providedIn: 'root'
})
export class CollectorService {

  private readonly informationProviders = new Set<InformationProvider>();
  private readonly signatureProviders = new Set<SignatureProvider>();

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly notificationService: NotificationService,
    private readonly translocoService: TranslocoService,
    private readonly publishersAlert: PublishersAlert
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
    return this.proofRepository.saveRawFile$(rawBase64, mimeType).pipe(
      // Get the proof hash from the uri.
      map(uri => fileNameWithoutExtension(uri)),
      // Store the media file.
      switchMap(hash => this.proofRepository.add$({ hash, mimeType, timestamp: Date.now() })),
      pluck(0)
    );
  }

  private collectAndSign$(proof: Proof) {
    const notificationId = this.notificationService.createNotificationId();
    this.notificationService.notify(
      notificationId,
      this.translocoService.translate('collectingProof'),
      this.translocoService.translate('collectingInformation')
    );
    return forkJoinWithDefault([...this.informationProviders].map(provider => provider.collectAndStore$(proof))).pipe(
      tap(_ => this.notificationService.notify(
        notificationId,
        this.translocoService.translate('collectingProof'),
        this.translocoService.translate('signingProof')
      )),
      switchMapTo(forkJoinWithDefault([...this.signatureProviders].map(provider => provider.signAndStore$(proof)))),
      tap(_ => this.notificationService.cancel(notificationId)),
      catchError(error => {
        this.notificationService.notifyError(notificationId, error);
        return EMPTY;
      }),
      mapTo(proof)
    );
  }

  addInformationProvider(...providers: InformationProvider[]) {
    providers.forEach(provider => this.informationProviders.add(provider));
  }

  removeInformationProvider(...providers: InformationProvider[]) {
    providers.forEach(provider => this.informationProviders.delete(provider));
  }

  addSignatureProvider(...providers: SignatureProvider[]) {
    providers.forEach(provider => this.signatureProviders.add(provider));
  }

  removeSignatureProvider(...providers: SignatureProvider[]) {
    providers.forEach(provider => this.signatureProviders.delete(provider));
  }
}
