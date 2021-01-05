import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, share } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { getStatus } from './transaction-details/transaction-details.page';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.page.html',
  styleUrls: ['./transaction.page.scss'],
})
export class TransactionPage {
  readonly transactionsWithStatus$ = this.diaBackendTransactionRepository
    .getAll$()
    .pipe(
      map(transactions =>
        transactions.map(transaction => ({
          ...transaction,
          status: getStatus(transaction, this.diaBackendAuthService.getEmail()),
        }))
      ),
      share()
    );
  readonly isFetching$ = this.diaBackendTransactionRepository.isFetching$();

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository
  ) {}
}
