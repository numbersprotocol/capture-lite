import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import { BehaviorSubject, defer, merge, of } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  pluck,
  tap,
} from 'rxjs/operators';
import { Database } from '../../database/database.service';
import { OnConflictStrategy, Tuple } from '../../database/table/table';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';

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
    private readonly database: Database
  ) {}

  getAll$() {
    return merge(this.fetchAll$(), this.table.queryAll$()).pipe(
      distinctUntilChanged(isEqual)
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

  // TODO: make private by using repository pattern
  oldFetchAll$() {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.get<ListTransactionResponse>(
          `${BASE_URL}/api/v2/transactions/`,
          { headers }
        )
      )
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
      tap(response => console.log(response))
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
  readonly fulfilled_at: string;
  readonly expired: boolean;
}

interface ListTransactionResponse {
  readonly results: DiaBackendTransaction[];
}

// tslint:disable-next-line: no-empty-interface
interface CreateTransactionResponse {}

// tslint:disable-next-line: no-empty-interface
interface AcceptTransactionResponse {}
