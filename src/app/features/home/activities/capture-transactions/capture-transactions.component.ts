import { Component } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, take } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../../../shared/dia-backend/transaction/dia-backend-transaction-repository.service';
import { ErrorService } from '../../../../shared/error/error.service';
import { getStatus } from '../capture-transaction-details/capture-transaction-details.page';

@Component({
  selector: 'app-capture-transactions',
  templateUrl: './capture-transactions.component.html',
  styleUrls: ['./capture-transactions.component.scss'],
})
export class CaptureTransactionsComponent {
  readonly transactionsWithStatus$ =
    this.diaBackendTransactionRepository.all$.pipe(
      take(1),
      map(transactions =>
        transactions.results.map(transaction => ({
          ...transaction,
          status: getStatus(transaction, this.diaBackendAuthService.getEmail()),
        }))
      ),
      catchError((err: unknown) => {
        this.errorService.toastError$(err).subscribe();
        return of([]);
      }),
      finalize(() => this.isFetching$.next(false)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  readonly isFetching$ = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly errorService: ErrorService
  ) {}
}
