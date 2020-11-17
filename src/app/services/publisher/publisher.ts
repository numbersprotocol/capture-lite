import { TranslocoService } from '@ngneat/transloco';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';
import { Proof } from '../repositories/proof/proof';

export abstract class Publisher {

  abstract readonly id: string;

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly notificationService: NotificationService
  ) { }

  publish(proof: Proof) {
    const notificationId = this.notificationService.createNotificationId();
    this.notificationService.notify(
      notificationId,
      this.translocoService.translate('publishingProof'),
      this.translocoService.translate('message.publishingProof', { hash: proof.hash, publisherName: this.id })
    );

    // Deliberately subscribe without untilDestroyed scope. Also, it is not feasible to use
    // subsctibeInBackground() as it will move the execution out of ngZone, which will prevent
    // the observables subscribed with async pipe from observing new values.
    this.run$(proof).pipe(
      tap(_ => this.notificationService.notify(
        notificationId,
        this.translocoService.translate('proofPublished'),
        this.translocoService.translate('message.proofPublished', { hash: proof.hash, publisherName: this.id })
      )),
      catchError((err: Error) => of(this.notificationService.notifyError(notificationId, err)))
    ).subscribe();
  }

  abstract isEnabled$(): Observable<boolean>;

  protected abstract run$(proof: Proof): Observable<void>;
}
