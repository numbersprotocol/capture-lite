import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { map, switchMap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../services/dia-backend/auth/dia-backend-auth.service';
import {
  DiaBackendTransaction,
  DiaBackendTransactionRepository,
} from '../../../../services/dia-backend/transaction/dia-backend-transaction-repository.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.page.html',
  styleUrls: ['./transaction-details.page.scss'],
})
export class TransactionDetailsPage {
  readonly transaction$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable(),
    switchMap(id => this.diaBackendTransactionRepository.getById$(id)),
    isNonNullable()
  );
  readonly status$ = this.transaction$.pipe(
    switchMap(transaction =>
      getStatus(transaction, this.diaBackendAuthService.getEmail())
    )
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly diaBackendAuthService: DiaBackendAuthService
  ) {}
}

export async function getStatus(
  transaction: DiaBackendTransaction,
  email: string | Promise<string>
) {
  email = await email;
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

enum Status {
  waitingToBeAccepted = 'waitingToBeAccepted',
  InProgress = 'inProgress',
  Returned = 'returned',
  Delivered = 'delivered',
  Accepted = 'accepted',
}
