import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../shared/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../../shared/dia-backend/transaction/dia-backend-transaction-repository.service';
import { ErrorService } from '../../../shared/error/error.service';
import { getStatus } from './transaction-details/transaction-details.page';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.page.html',
  styleUrls: ['./transaction.page.scss'],
})
export class TransactionPage {
  readonly transactionsWithStatus$ = this.diaBackendTransactionRepository.all$.pipe(
    catchError((err: unknown) => this.errorService.toastError$(err)),
    map(transactions =>
      transactions.results.map(transaction => ({
        ...transaction,
        status: getStatus(transaction, this.diaBackendAuthService.getEmail()),
      }))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly isFetching$ = this.diaBackendTransactionRepository.isFetching$;

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly errorService: ErrorService
  ) {}
}
