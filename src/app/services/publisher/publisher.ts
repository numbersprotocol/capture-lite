import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { subscribeInBackground } from 'src/app/utils/background-task/background-task';
import { Proof } from '../data/proof/proof';
import { NotificationService } from '../notification/notification.service';

export abstract class Publisher {

  abstract readonly name: string;

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly notificationService: NotificationService
  ) { }

  publish(proof: Proof) {
    const notificationId = this.notificationService.createNotificationId();
    this.notificationService.notify(
      notificationId,
      this.translocoService.translate('publishingProof'),
      this.translocoService.translate('message.publishingProof', { hash: proof.hash, publisherName: this.name })
    );
    subscribeInBackground(
      this.run$(proof).pipe(
        tap(_ => this.notificationService.notify(
          notificationId,
          this.translocoService.translate('proofPublished'),
          this.translocoService.translate('message.proofPublished', { hash: proof.hash, publisherName: this.name })
        ))
      )
    );
  }

  abstract isEnabled$(): Observable<boolean>;

  protected abstract run$(proof: Proof): Observable<void>;
}
