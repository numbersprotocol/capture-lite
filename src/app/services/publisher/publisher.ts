import { TranslocoService } from '@ngneat/transloco';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';
import { OldProof } from '../repositories/proof/old-proof-adapter';
import { Proof } from '../repositories/proof/proof';

export abstract class Publisher {

  abstract readonly id: string;

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly notificationService: NotificationService
  ) { }

  oldPublish(proof: OldProof) {
    const notificationId = this.notificationService.createNotificationId();
    this.notificationService.notify(
      notificationId,
      this.translocoService.translate('registeringAsset'),
      this.translocoService.translate('message.registeringAsset', { hash: proof.hash, publisherName: this.id })
    );

    // Deliberately subscribe without untilDestroyed scope. Also, it is not feasible to use
    // subsctibeInBackground() as it will move the execution out of ngZone, which will prevent
    // the observables subscribed with async pipe from observing new values.
    this.oldRun$(proof).pipe(
      tap(_ => this.notificationService.notify(
        notificationId,
        this.translocoService.translate('assetRegistered'),
        this.translocoService.translate('message.assetRegistered', { hash: proof.hash, publisherName: this.id })
      )),
      catchError((err: Error) => of(this.notificationService.notifyError(notificationId, err)))
    ).subscribe();
  }

  abstract isEnabled$(): Observable<boolean>;

  protected abstract oldRun$(proof: OldProof): Observable<void>;

  async publish(proof: Proof) {
    const notificationId = this.notificationService.createNotificationId();
    try {
      this.notificationService.notify(
        notificationId,
        this.translocoService.translate('publishingProof'),
        this.translocoService.translate('message.publishingProof', { hash: await proof.getId(), publisherName: this.id })
      );

      await this.run(proof);

      this.notificationService.notify(
        notificationId,
        this.translocoService.translate('proofPublished'),
        this.translocoService.translate('message.proofPublished', { hash: await proof.getId(), publisherName: this.id })
      );

      return proof;
    } catch (e) {
      this.notificationService.notifyError(notificationId, e);
    }
  }

  protected abstract async run(proof: Proof): Promise<Proof>;
}
