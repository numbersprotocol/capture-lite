// tslint:disable: no-magic-numbers

import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  defer,
  Subject,
  throwError,
} from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  first,
  map,
  pluck,
  repeatWhen,
  tap,
} from 'rxjs/operators';
import { Tuple } from '../../database/table/table';
import { DiaBackendAssetRepository } from '../asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { NotFoundErrorResponse } from '../errors';
import { PaginatedResponse } from '../pagination';
import { BASE_URL } from '../secret';
import { IgnoredTransactionRepository } from './ignored-transaction-repository.service';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendTransactionRepository {
  private readonly _isFetching$ = new BehaviorSubject(false);

  readonly isFetching$ = this._isFetching$.pipe(distinctUntilChanged());

  private readonly allCount$ = this.list$({ limit: 1 }).pipe(
    pluck('count'),
    repeatWhen(() => this.updated$)
  );

  readonly all$ = this.allCount$.pipe(
    first(),
    concatMap(count => this.list$({ limit: count })),
    repeatWhen(() => this.updated$)
  );

  readonly inbox$ = combineLatest([
    this.all$,
    this.ignoredTransactionRepository.all$,
    this.authService.email$,
  ]).pipe(
    map(([transactions, ignoredTransactions, email]) =>
      transactions.results.filter(
        transaction =>
          transaction.receiver_email === email &&
          !transaction.fulfilled_at &&
          !transaction.expired &&
          !ignoredTransactions.includes(transaction.id)
      )
    )
  );

  private readonly updated$ = new Subject<{ reason: string }>();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly ignoredTransactionRepository: IgnoredTransactionRepository,
    private readonly assetRepositroy: DiaBackendAssetRepository
  ) {}

  fetchById$(id: string) {
    return this.read$({ id });
  }

  private list$({ offset, limit }: { offset?: number; limit?: number }) {
    return defer(async () => this._isFetching$.next(true)).pipe(
      concatMapTo(defer(() => this.authService.getAuthHeaders())),
      concatMap(headers => {
        let params = new HttpParams();

        if (offset !== undefined) {
          params = params.set('offset', `${offset}`);
        }
        if (limit !== undefined) {
          params = params.set('limit', `${limit}`);
        }

        return this.httpClient.get<PaginatedResponse<DiaBackendTransaction>>(
          `${BASE_URL}/api/v2/transactions/`,
          { headers, params }
        );
      }),
      tap(() => this._isFetching$.next(false))
    );
  }

  private read$({ id }: { id: string }) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.get<DiaBackendTransaction>(
          `${BASE_URL}/api/v2/transactions/${id}/`,
          { headers }
        )
      ),
      catchError(err => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          return throwError(new NotFoundErrorResponse(err));
        }
        return throwError(err);
      })
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
      tap(() => this.refresh({ reason: this.add$.name }))
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
      tap(() => {
        const reason = `${DiaBackendTransactionRepository.name}.${this.accept$.name}`;
        this.refresh({ reason });
        this.assetRepositroy.refreshPostCaptures({ reason });
      })
    );
  }

  refresh({ reason }: { reason: string }) {
    this.updated$.next({ reason });
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

type CreateTransactionResponse = DiaBackendTransaction;

// tslint:disable-next-line: no-empty-interface
interface AcceptTransactionResponse {}
