import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { first, shareReplay, switchMapTo } from 'rxjs/operators';
import { BlockingActionService } from '../../../services/blocking-action/blocking-action.service';
import { DiaBackendTransactionRepository } from '../../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { IgnoredTransactionRepository } from '../../../services/dia-backend/transaction/ignored-transaction-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage {
  readonly receivedTransactions$ = this.diaBackendTransactionRepository
    .getInbox$()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  readonly isFetching$ = this.diaBackendTransactionRepository.isFetching$();

  constructor(
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository,
    private readonly blockingActionService: BlockingActionService
  ) {}

  accept(id: string) {
    const action$ = this.diaBackendTransactionRepository
      .accept$(id)
      .pipe(
        first(),
        switchMapTo(this.diaBackendTransactionRepository.refresh$())
      );

    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  async ignore(id: string) {
    await this.ignoredTransactionRepository.add(id);
  }
}
