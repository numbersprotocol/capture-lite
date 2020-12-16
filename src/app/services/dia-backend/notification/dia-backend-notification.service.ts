import { Injectable } from '@angular/core';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import { DiaBackendAssetRepository } from '../asset/dia-backend-asset-repository.service';
import { DiaBackendTransactionRepository } from '../transaction/dia-backend-transaction-repository.service';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendNotificationService {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly transactionRepository: DiaBackendTransactionRepository,
    private readonly assetRepositroy: DiaBackendAssetRepository
  ) {}

  initialize$() {
    return this.pushNotificationService.getPushData$().pipe(
      isDiaBackendPushNotificationData(),
      concatMap(data => {
        if (data.app_message_type === 'transaction_received') {
          return this.transactionRepository.refresh$();
        }
        if (data.app_message_type === 'transaction_expired') {
          return forkJoin([
            this.transactionRepository.refresh$(),
            this.assetRepositroy.refresh$(),
          ]);
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
