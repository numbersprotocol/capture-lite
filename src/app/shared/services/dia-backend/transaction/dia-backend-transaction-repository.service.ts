import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, defer, merge } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  map,
  pluck,
  single,
  tap,
} from 'rxjs/operators';
import { Tuple } from '../../database/table/table';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';
import { IgnoredTransactionRepository } from './ignored-transaction-repository.service';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendTransactionRepository {
  private readonly _isFetching$ = new BehaviorSubject(false);

  private readonly fetchAllCache$ = new BehaviorSubject<
    DiaBackendTransaction[]
  >([]);

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository
  ) {}

  isFetching$() {
    return this._isFetching$.asObservable();
  }

  getAll$() {
    return merge(this.fetchAll$(), this.fetchAllCache$.asObservable());
  }

  getById$(id: string) {
    return this.getAll$().pipe(
      map(transactions =>
        transactions.find(transaction => transaction.id === id)
      )
    );
  }

  refresh$() {
    return this.fetchAll$().pipe(single());
  }

  private fetchAll$() {
    return defer(async () => this._isFetching$.next(true)).pipe(
      concatMapTo(defer(() => this.authService.getAuthHeaders())),
      concatMap(headers =>
        this.httpClient.get<ListTransactionResponse>(
          `${BASE_URL}/api/v2/transactions/`,
          { headers }
        )
      ),
      pluck('results'),
      tap(transactions => this.fetchAllCache$.next(transactions)),
      tap(() => this._isFetching$.next(false))
    );
  }

  add$(assetId: string, targetEmail: string, caption: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post<CreateTransactionResponse>(
          `${BASE_URL}/api/v2/transactions/`,
          { asset_id: assetId, email: targetEmail, caption },
          { headers }
        )
      )
    );
  }

  accept$(id: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post<AcceptTransactionResponse>(
          `${BASE_URL}/api/v2/transactions/${id}/accept/`,
          {},
          { headers }
        )
      )
    );
  }

  getInbox$() {
    return combineLatest([
      this.getAll$(),
      this.ignoredTransactionRepository.getAll$(),
      this.authService.email$,
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
  }
}

export interface DiaBackendTransaction extends Tuple {
  readonly id: string;
  readonly asset: {
    readonly id: string;
    readonly asset_file_thumbnail: string;
    readonly caption: string;
  };
  readonly sender: string;
  readonly receiver_email: string;
  readonly created_at: string;
  readonly fulfilled_at: string | null;
  readonly expired: boolean;
}

interface ListTransactionResponse {
  readonly results: DiaBackendTransaction[];
}

type CreateTransactionResponse = DiaBackendTransaction;

// tslint:disable-next-line: no-empty-interface
interface AcceptTransactionResponse {}
