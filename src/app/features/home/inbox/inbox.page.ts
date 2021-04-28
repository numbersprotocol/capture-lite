import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, concatMapTo, first, shareReplay } from 'rxjs/operators';
import { ErrorService } from '../../../shared/modules/error/error.service';
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
    catchError((err: unknown) => this.errorService.toastError$(err)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly isFetching$ = this.diaBackendTransactionRepository.isFetching$;

  constructor(
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository,
    private readonly blockingActionService: BlockingActionService,
    private readonly errorService: ErrorService
  ) {}

  accept(id: string) {
    const action$ = this.diaBackendTransactionRepository
      .accept$(id)
      .pipe(concatMapTo(this.diaBackendTransactionRepository.inbox$), first());

    this.blockingActionService
      .run$(action$)
      .pipe(
        catchError((err: unknown) => this.errorService.toastError$(err)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async ignore(id: string) {
    await this.ignoredTransactionRepository.add(id);
  }
}
