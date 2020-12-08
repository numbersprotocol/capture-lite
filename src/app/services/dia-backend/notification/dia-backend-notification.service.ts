import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { EMPTY, Observable } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { NotificationService } from '../../notification/notification.service';
import { PushNotificationService } from '../../push-notification/push-notification.service';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendNotificationService {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly notificationService: NotificationService,
    private readonly translocoService: TranslocoService
  ) {}

  initialize$() {
    return this.pushNotificationService.getPushData$().pipe(
      isDiaBackendPushNotificationData(),
      concatMap(data => {
        if (data.app_message_type === 'transaction_received') {
          return this.notificationService.notify(
            this.translocoService.translate('transactionReceived'),
            this.translocoService.translate('message.transactionReceived')
          );
        }
        if (data.app_message_type === 'transaction_expired') {
          return this.notificationService.notify(
            this.translocoService.translate('transactionExpired'),
            this.translocoService.translate('message.transactionExpired')
          );
        }
        return EMPTY;
      })
    );
  }
}

interface PushNotificationData {
  readonly app_message_type:
    | 'transaction_received'
    | 'transaction_accepted'
    | 'transaction_expired';
  readonly sender: 'string';
}

function isDiaBackendPushNotificationData() {
  return (source$: Observable<any>) =>
    source$.pipe(
      filter(
        (v): v is PushNotificationData =>
          v.app_message_type !== undefined && v.sender !== undefined
      )
    );
}
