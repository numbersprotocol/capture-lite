import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { subscribeInBackground } from 'src/app/utils/background-task/background-task';
import { Proof } from '../data/proof/proof';
import { NotificationService } from '../notification/notification.service';

export abstract class Publisher {

  abstract readonly name: string;

  constructor(
    private readonly translateService: TranslateService,
    private readonly notificationService: NotificationService
  ) { }

  publish(proof: Proof) {
    const notificationId = this.notificationService.createNotificationId();
    this.notificationService.notify(
      notificationId,
      this.translateService.instant('publishingProof'),
      this.translateService.instant('message.publishingProof', { hash: proof.hash, publisherName: this.name })
    );
    subscribeInBackground(
      this.run$(proof).pipe(
        tap(_ => this.notificationService.notify(
          notificationId,
          this.translateService.instant('proofPublished'),
          this.translateService.instant('message.proofPublished', { hash: proof.hash, publisherName: this.name })
        ))
      )
    );
  }

  protected abstract run$(proof: Proof): Observable<void>;
}
