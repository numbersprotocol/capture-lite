import { Inject, Injectable } from '@angular/core';
import { AppPlugin } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { combineLatest, defer, EMPTY, Observable } from 'rxjs';
import { concatMap, filter, tap } from 'rxjs/operators';
import { APP_PLUGIN } from '../../capacitor-plugins/capacitor-plugins.module';
import { NotificationService } from '../../notification/notification.service';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import { DiaBackendTransactionRepository } from '../transaction/dia-backend-transaction-repository.service';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendNotificationService {
  constructor(
    @Inject(APP_PLUGIN)
    private readonly appPlugin: AppPlugin,
    private readonly pushNotificationService: PushNotificationService,
    private readonly transactionRepository: DiaBackendTransactionRepository,
    private readonly notificationService: NotificationService,
    private readonly translocoService: TranslocoService
  ) {}

  initialize$() {
    return this.pushNotificationService.getPushData$().pipe(
      isDiaBackendPushNotificationData(),
      concatMap(data => {
        if (data.app_message_type === 'transaction_received') {
          return defer(() => this.notifyTransactionReceived()).pipe(
            tap(() =>
              this.transactionRepository.refresh({
                reason: `this.pushNotificationService.getPushData$.${data.app_message_type}`,
              })
            )
          );
        }
        if (data.app_message_type === 'transaction_expired') {
          return defer(() => this.notifyTransactionExpired()).pipe(
            tap(() =>
              this.transactionRepository.refresh({
                reason: `this.pushNotificationService.getPushData$.${data.app_message_type}`,
              })
            )
          );
        }
        return EMPTY;
      })
    );
  }

  private async needLocalNotification() {
    if (Capacitor.platform !== 'android') {
      return false;
    }
    return (await this.appPlugin.getState()).isActive;
  }

  private async notifyTransactionReceived() {
    if (!(await this.needLocalNotification())) {
      return;
    }
    return combineLatest([
      this.translocoService.selectTranslate('transactionReceived'),
      this.translocoService.selectTranslate('message.transactionReceived'),
    ]).pipe(
      concatMap(([title, body]) => this.notificationService.notify(title, body))
    );
  }

  private async notifyTransactionExpired() {
    if (!(await this.needLocalNotification())) {
      return;
    }
    return combineLatest([
      this.translocoService.selectTranslate('transactionExpired'),
      this.translocoService.selectTranslate('message.transactionExpired'),
    ]).pipe(
      concatMap(([title, body]) => this.notificationService.notify(title, body))
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
