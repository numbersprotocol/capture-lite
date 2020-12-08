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
            this.translocoService.translate('newTransactionReceived'),
            this.translocoService.translate('message.newTransactionReceived')
          );
        }
        return EMPTY;
      })
    );
  }
}

interface PushNotificationData {
  app_message_type:
    | 'transaction_received'
    | 'transaction_accepted'
    | 'transaction_expired';
  sender: 'string';
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
