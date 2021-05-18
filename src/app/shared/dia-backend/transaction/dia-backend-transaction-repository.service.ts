import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, defer, forkJoin, Subject } from 'rxjs';
import {
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
import { OnboardingService } from '../../onboarding/onboarding.service';
import { ProofRepository } from '../../repositories/proof/proof-repository.service';
import { DiaBackendAssetRepository } from '../asset/dia-backend-asset-repository.service';
import { DiaBackendAssetDownloadingService } from '../asset/downloading/dia-backend-downloading.service';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { DiaBackendContactRepository } from '../contact/dia-backend-contact-repository.service';
import { PaginatedResponse } from '../pagination';
import { BASE_URL } from '../secret';

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

  private readonly inboxCount$ = this.fetchInbox$({ limit: 1 }).pipe(
    pluck('count'),
    repeatWhen(() => this.updated$)
  );

  readonly all$ = this.allCount$.pipe(
    first(),
    concatMap(count => this.list$({ limit: count })),
    repeatWhen(() => this.updated$)
  );

  readonly inbox$ = this.inboxCount$.pipe(
    first(),
    concatMap(count => this.fetchInbox$({ limit: count })),
    repeatWhen(() => this.updated$)
  );

  private readonly updated$ = new Subject<{ reason?: string }>();

  readonly downloadExpired$ = combineLatest([
    this.all$,
    this.proofRepository.all$,
    this.authService.email$,
    defer(() => this.onboardingService.getOnboardingTimestamp()),
  ]).pipe(
    first(),
    map(([transactions, proofs, email, onboardingTimestamp]) => {
      const delieveredAssetIds = transactions.results
        .filter(t => !t.expired && t.fulfilled_at)
        .map(t => t.asset.id);
      return transactions.results.filter(
        t =>
          onboardingTimestamp &&
          Date.parse(t.created_at) > onboardingTimestamp &&
          t.expired &&
          t.sender === email &&
          !delieveredAssetIds.includes(t.asset.id) &&
          !proofs.map(p => p.diaBackendAssetId).includes(t.asset.id)
      );
    }),
    concatMap(newlyReturnedTransactions =>
      forkJoin(
        newlyReturnedTransactions.map(t =>
          this.assetRepositroy.fetchById$(t.asset.id).pipe(first())
        )
      )
    ),
    concatMap(newlyReturnedAssets =>
      Promise.all(
        newlyReturnedAssets.map(async asset =>
          this.assetDownloadingService.storeRemoteCapture(asset)
        )
      )
    )
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly assetRepositroy: DiaBackendAssetRepository,
    private readonly assetDownloadingService: DiaBackendAssetDownloadingService,
    private readonly proofRepository: ProofRepository,
    private readonly contactRepository: DiaBackendContactRepository,
    private readonly onboardingService: OnboardingService
  ) {}

  fetchById$(id: string) {
    return this.read$({ id });
  }

  private fetchInbox$({ offset, limit }: { offset?: number; limit?: number }) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        let params = new HttpParams();

        if (offset !== undefined) {
          params = params.set('offset', `${offset}`);
        }
        if (limit !== undefined) {
          params = params.set('limit', `${limit}`);
        }
        return this.httpClient.get<PaginatedResponse<DiaBackendTransaction>>(
          `${BASE_URL}/api/v2/transactions/inbox/`,
          { headers, params }
        );
      })
    );
  }

  private list$({ offset, limit }: { offset?: number; limit?: number }) {
    // eslint-disable-next-line @typescript-eslint/require-await
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
      tap(() => {
        this.refresh({ reason: 'this.add$' });
        this.contactRepository.refresh({
          reason: `DiaBackendTransactionRepository.add$`,
        });
        this.assetRepositroy.refreshPostCaptures({
          reason: `DiaBackendTransactionRepository.add$`,
        });
      })
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
        const reason = `DiaBackendTransactionRepository.this.accept$`;
        this.refresh({ reason });
        this.assetRepositroy.refreshPostCaptures({ reason });
      })
    );
  }

  ignore$(id: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post<AcceptTransactionResponse>(
          `${BASE_URL}/api/v2/transactions/${id}/ignore/`,
          {},
          { headers }
        )
      ),
      tap(() => {
        const reason = `DiaBackendTransactionRepository.this.ignore$`;
        this.refresh({ reason });
        this.assetRepositroy.refreshPostCaptures({ reason });
      })
    );
  }

  /**
   * The reason argument is only for debugging purpose for code tracing.
   */
  refresh(options?: { reason?: string }) {
    this.updated$.next({ reason: options?.reason });
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AcceptTransactionResponse {}
