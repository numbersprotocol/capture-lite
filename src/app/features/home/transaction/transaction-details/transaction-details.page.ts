import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import {
  DiaBackendTransaction,
  DiaBackendTransactionRepository,
} from '../../../../shared/dia-backend/transaction/dia-backend-transaction-repository.service';
import { ErrorService } from '../../../../shared/error/error.service';
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
    switchMap(id => this.diaBackendTransactionRepository.fetchById$(id)),
    catchError((err: unknown) => this.errorService.toastError$(err)),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  readonly status$ = this.transaction$.pipe(
    switchMap(transaction =>
      getStatus(transaction, this.diaBackendAuthService.getEmail())
    )
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly errorService: ErrorService
  ) {}
}

export async function getStatus(
  transaction: DiaBackendTransaction,
  email: string | Promise<string>
) {
  const resolvedEmail = await email;
  if (transaction.expired) {
    if (transaction.sender === resolvedEmail) {
      return Status.Returned;
    }
    return Status.Missed;
  }
  if (!transaction.fulfilled_at) {
    if (transaction.receiver_email === resolvedEmail) {
      return Status.InProgress;
    }
    return Status.waitingToBeAccepted;
  }
  if (transaction.sender === resolvedEmail) {
    return Status.Delivered;
  }
  return Status.Received;
}

enum Status {
  waitingToBeAccepted = 'waitingToBeAccepted',
  InProgress = 'inProgress',
  Returned = 'returned',
  Missed = 'missed',
  Delivered = 'delivered',
  Received = 'received',
}
