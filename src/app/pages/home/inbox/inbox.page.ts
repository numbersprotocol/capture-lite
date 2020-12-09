import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { BlockingActionService } from '../../../services/blocking-action/blocking-action.service';
import { DiaBackendAuthService } from '../../../services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { IgnoredTransactionRepository } from '../../../services/dia-backend/transaction/ignored-transaction-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage {
  readonly receivedTransactions$ = combineLatest([
    this.diaBackendTransactionRepository.getAll$(),
    this.ignoredTransactionRepository.getAll$(),
    this.diaBackendAuthService.getEmail$(),
  ]).pipe(
    map(([transactions, ignoredTransactions, email]) =>
      transactions.filter(
        transaction =>
          transaction.receiver_email === email &&
          !transaction.fulfilled_at &&
          !transaction.expired &&
          !ignoredTransactions.includes(transaction.id)
      )
    )
  );
  readonly isFetching$ = this.diaBackendTransactionRepository.isFetching$();

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository,
    private readonly blockingActionService: BlockingActionService
  ) {}

  accept(id: string) {
    const action$ = this.diaBackendTransactionRepository
      .accept$(id)
      .pipe(first());

    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  async ignore(id: string) {
    await this.ignoredTransactionRepository.add(id);
  }
}
