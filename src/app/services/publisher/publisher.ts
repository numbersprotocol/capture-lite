import { TranslocoService } from '@ngneat/transloco';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';
import { ProofOld } from '../repositories/proof/old-proof';

export abstract class Publisher {

  abstract readonly id: string;

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly notificationService: NotificationService
  ) { }

  publish(proof: ProofOld) {
    const notificationId = this.notificationService.createNotificationId();
    this.notificationService.notify(
      notificationId,
      this.translocoService.translate('registeringAsset'),
      this.translocoService.translate('message.registeringAsset', { hash: proof.hash, publisherName: this.id })
    );

    // Deliberately subscribe without untilDestroyed scope. Also, it is not feasible to use
    // subsctibeInBackground() as it will move the execution out of ngZone, which will prevent
    // the observables subscribed with async pipe from observing new values.
    this.run$(proof).pipe(
      tap(_ => this.notificationService.notify(
        notificationId,
        this.translocoService.translate('assetRegistered'),
        this.translocoService.translate('message.assetRegistered', { hash: proof.hash, publisherName: this.id })
      )),
      catchError((err: Error) => of(this.notificationService.notifyError(notificationId, err)))
    ).subscribe();
  }

  abstract isEnabled$(): Observable<boolean>;

  protected abstract run$(proof: ProofOld): Observable<void>;
}
