import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isEqual, omit } from 'lodash';
import {
  BehaviorSubject,
  combineLatest,
  defer,
  merge,
  Observable,
  of,
} from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  map,
  pluck,
  tap,
} from 'rxjs/operators';
import {
  switchTap,
  switchTapTo,
} from '../../../utils/rx-operators/rx-operators';
import { Database } from '../../database/database.service';
import { OnConflictStrategy, Tuple } from '../../database/table/table';
import { DiaBackendAssetRepository } from '../asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';
import { IgnoredTransactionRepository } from './ignored-transaction-repository.service';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendTransactionRepository {
  private readonly table = this.database.getTable<DiaBackendTransaction>(
    DiaBackendTransactionRepository.name
  );
  private readonly _isFetching$ = new BehaviorSubject(false);

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly database: Database,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository
  ) {}

  getAll$(): Observable<DiaBackendTransaction[]> {
    return merge(this.fetchAll$(), this.table.queryAll$()).pipe(
      distinctUntilChanged((transactionsX, transactionsY) =>
        isEqual(
          transactionsX.map(x => omit(x, 'asset.asset_file_thumbnail')),
          transactionsY.map(y => omit(y, 'asset.asset_file_thumbnail'))
        )
      )
    );
  }

  getById$(id: string) {
    return this.getAll$().pipe(
      map(transactions =>
        transactions.find(transaction => transaction.id === id)
      )
    );
  }

  isFetching$() {
    return this._isFetching$.asObservable();
  }

  private fetchAll$() {
    return of(this._isFetching$.next(true)).pipe(
      concatMapTo(defer(() => this.authService.getAuthHeaders())),
      concatMap(headers =>
        this.httpClient.get<ListTransactionResponse>(
          `${BASE_URL}/api/v2/transactions/`,
          { headers }
        )
      ),
      pluck('results'),
      concatMap(transactions =>
        this.table.insert(
          transactions,
          OnConflictStrategy.REPLACE,
          (x, y) => x.id === y.id
        )
      ),
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
      ),
      switchTap(response => defer(() => this.table.insert([response])))
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
      ),
      switchTapTo(this.fetchAll$()),
      switchTapTo(this.diaBackendAssetRepository.refresh$())
    );
  }

  getInbox$() {
    return combineLatest([
      this.getAll$(),
      this.ignoredTransactionRepository.getAll$(),
      this.authService.getEmail$(),
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

// tslint:disable-next-line: no-empty-interface
interface CreateTransactionResponse extends DiaBackendTransaction {}

// tslint:disable-next-line: no-empty-interface
interface AcceptTransactionResponse {}
