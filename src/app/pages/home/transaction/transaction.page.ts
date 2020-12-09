import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { concatMap, pluck } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../services/dia-backend/auth/dia-backend-auth.service';
import {
  DiaBackendTransaction,
  DiaBackendTransactionRepository,
} from '../../../services/dia-backend/transaction/dia-backend-transaction-repository.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.page.html',
  styleUrls: ['./transaction.page.scss'],
})
export class TransactionPage {
  readonly status = Status;
  readonly transactionsWithStatus$ = this.diaBackendTransactionRepository
    .getAll$()
    .pipe(
      pluck('results'),
      concatMap(activities =>
        Promise.all(
          activities.map(async transaction => ({
            ...transaction,
            status: await this.getStatus(transaction),
          }))
        )
      )
    );

  constructor(
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository
  ) {}

  private async getStatus(transaction: DiaBackendTransaction) {
    const email = await this.diaBackendAuthService.getEmail();
    if (transaction.expired) {
      return Status.Returned;
    }
    if (!transaction.fulfilled_at) {
      if (transaction.receiver_email === email) {
        return Status.InProgress;
      }
      return Status.waitingToBeAccepted;
    }
    if (transaction.sender === email) {
      return Status.Delivered;
    }
    return Status.Accepted;
  }
}

export enum Status {
  waitingToBeAccepted = 'waitingToBeAccepted',
  InProgress = 'inProgress',
  Returned = 'returned',
  Delivered = 'delivered',
  Accepted = 'accepted',
}
