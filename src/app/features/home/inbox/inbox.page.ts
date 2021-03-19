import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { concatMapTo, first, shareReplay } from 'rxjs/operators';
import { BlockingActionService } from '../../../shared/services/blocking-action/blocking-action.service';
import { DiaBackendTransactionRepository } from '../../../shared/services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { IgnoredTransactionRepository } from '../../../shared/services/dia-backend/transaction/ignored-transaction-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage {
  readonly receivedTransactions$ = this.diaBackendTransactionRepository.inbox$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly isFetching$ = this.diaBackendTransactionRepository.isFetching$;

  constructor(
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository,
    private readonly blockingActionService: BlockingActionService
  ) {}

  accept(id: string) {
    const action$ = this.diaBackendTransactionRepository
      .accept$(id)
      .pipe(concatMapTo(this.diaBackendTransactionRepository.inbox$), first());

    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  async ignore(id: string) {
    await this.ignoredTransactionRepository.add(id);
  }
}
