import { Inject, Injectable } from '@angular/core';
import { AppPlugin, Capacitor } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { defer, EMPTY, Observable } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { APP_PLUGIN } from '../../../shared/capacitor-plugins/capacitor-plugins.module';
import { switchTapTo } from '../../../utils/rx-operators/rx-operators';
import { NotificationService } from '../../notification/notification.service';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import { DiaBackendAssetRepository } from '../asset/dia-backend-asset-repository.service';
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
    private readonly assetRepositroy: DiaBackendAssetRepository,
    private readonly notificationService: NotificationService,
    private readonly translocoService: TranslocoService
  ) {}

  initialize$() {
    return this.pushNotificationService.getPushData$().pipe(
      isDiaBackendPushNotificationData(),
      concatMap(data => {
        if (data.app_message_type === 'transaction_received') {
          return defer(() => this.notifyTransactionReceived()).pipe(
            switchTapTo(this.transactionRepository.refresh$())
          );
        }
        if (data.app_message_type === 'transaction_expired') {
          return defer(() => this.notifyTransactionExpired()).pipe(
            switchTapTo(this.transactionRepository.refresh$()),
            switchTapTo(this.assetRepositroy.refresh$())
          );
        }
        return EMPTY;
      })
    );
  }

  private async requireNotify(): Promise<boolean> {
    if (Capacitor.platform !== 'android') {
      return Promise.resolve(false);
    }
    return (await this.appPlugin.getState()).isActive;
  }

  private async notifyTransactionReceived() {
    if (!(await this.requireNotify())) {
      return;
    }
    return this.notificationService.notify(
      this.translocoService.translate('transactionReceived'),
      this.translocoService.translate('message.transactionReceived')
    );
  }

  private async notifyTransactionExpired() {
    if (!(await this.requireNotify())) {
      return;
    }
    return this.notificationService.notify(
      this.translocoService.translate('transactionExpired'),
      this.translocoService.translate('message.transactionExpired')
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
