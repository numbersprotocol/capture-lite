import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  defer,
  forkJoin,
  iif,
  merge,
  of,
  ReplaySubject,
  Subject,
  throwError,
} from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  first,
  map,
  pluck,
  repeatWhen,
  switchMap,
  tap,
} from 'rxjs/operators';
import { base64ToBlob } from '../../../../utils/encoding/encoding';
import { MimeType, toExtension } from '../../../../utils/mime-type';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
import { Tuple } from '../../database/table/table';
import {
  getOldProof,
  getOldSignatures,
  getSortedProofInformation,
  OldSignature,
  SortedProofInformation,
} from '../../repositories/proof/old-proof-adapter';
import { Proof } from '../../repositories/proof/proof';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { PaginatedResponse } from '../pagination';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendAssetRepository {
  private readonly postCapturesCache$ = new ReplaySubject<
    PaginatedResponse<DiaBackendAsset>
  >(1);

  private readonly postCapturesImageCache$ = new BehaviorSubject(
    new Map<string, Blob>()
  );

  readonly fetchCapturesCount$ = this.list$({
    limit: 1,
    isOriginalOwner: true,
  }).pipe(pluck('count'));

  private readonly postCapturesCount$ = this.list$({
    limit: 1,
    isOriginalOwner: false,
  }).pipe(
    pluck('count'),
    repeatWhen(() => this.postCapturesUpdated$)
  );

  private readonly postCapturesUpdated$ = new Subject<{ reason?: string }>();

  readonly postCaptures$ = merge(
    this.postCapturesCache$,
    this.postCapturesCount$.pipe(
      first(),
      concatMap(count =>
        this.list$({
          isOriginalOwner: false,
          orderBy: 'source_transaction',
          limit: count,
        })
      ),
      tap(response => this.postCapturesCache$.next(response)),
      repeatWhen(() => this.postCapturesUpdated$)
    )
  ).pipe(distinctUntilChanged());

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  fetchById$(id: string) {
    return this.read$({ id });
  }

  fetchByProof$(proof: Proof) {
    return this.list$({ proofHash: getOldProof(proof).hash }).pipe(
      concatMap(response =>
        iif(
          () => response.count > 0,
          of(response.results[0]),
          throwError(new HttpErrorResponse({ status: 404 }))
        )
      )
    );
  }

  fetchCaptures$({ limit, offset = 0 }: { limit: number; offset?: number }) {
    return this.list$({ offset, limit, isOriginalOwner: true });
  }

  getPostCaptureById$(id: string) {
    return merge(
      this.postCapturesCache$.pipe(
        map(postCaptures => postCaptures.results.find(p => p.id === id)),
        isNonNullable()
      ),
      this.fetchById$(id)
    );
  }

  getAndCachePostCaptureMedia$(postCapture: DiaBackendAsset) {
    return this.postCapturesImageCache$.pipe(
      map(cache => cache.get(postCapture.id)),
      switchMap(image =>
        iif(
          () => !!image,
          of(image).pipe(isNonNullable()),
          this.downloadFile$({ id: postCapture.id, field: 'asset_file' }).pipe(
            first(),
            tap(blob => {
              // eslint-disable-next-line rxjs/no-subject-value
              const currentCache = this.postCapturesImageCache$.value;
              currentCache.set(postCapture.id, blob);
              this.postCapturesImageCache$.next(currentCache);
            })
          )
        )
      )
    );
  }

  private list$({
    offset,
    limit,
    orderBy,
    isOriginalOwner,
    proofHash,
  }: {
    offset?: number;
    limit?: number;
    orderBy?: 'source_transaction';
    isOriginalOwner?: boolean;
    proofHash?: string;
  }) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        let params = new HttpParams();

        if (offset !== undefined) {
          params = params.set('offset', `${offset}`);
        }
        if (limit !== undefined) {
          params = params.set('limit', `${limit}`);
        }
        if (isOriginalOwner !== undefined) {
          params = params.set('is_original_owner', `${isOriginalOwner}`);
        }
        if (orderBy !== undefined) {
          params = params.set('order_by', `${orderBy}`);
        }
        if (proofHash !== undefined) {
          params = params.set('proof_hash', `${proofHash}`);
        }

        return this.httpClient.get<PaginatedResponse<DiaBackendAsset>>(
          `${BASE_URL}/api/v2/assets/`,
          { headers, params }
        );
      })
    );
  }

  private read$({ id }: { id: string }) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.get<DiaBackendAsset>(
          `${BASE_URL}/api/v2/assets/${id}/`,
          { headers }
        )
      )
    );
  }

  downloadFile$({ id, field }: { id: string; field: AssetDownloadField }) {
    const formData = new FormData();
    formData.append('field', field);
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post(
          `${BASE_URL}/api/v2/assets/${id}/download/`,
          formData,
          { headers, responseType: 'blob' }
        )
      )
    );
  }

  addCapture$(proof: Proof) {
    return forkJoin([
      defer(() => this.authService.getAuthHeaders()),
      defer(() => buildFormDataToCreateAsset(proof)),
    ]).pipe(
      concatMap(([headers, formData]) =>
        this.httpClient.post<CreateAssetResponse>(
          `${BASE_URL}/api/v2/assets/`,
          formData,
          { headers }
        )
      )
    );
  }

  removeCaptureById$(id: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.delete<DeleteAssetResponse>(
          `${BASE_URL}/api/v2/assets/${id}/`,
          { headers }
        )
      )
    );
  }

  /**
   * The reason argument is only for debugging purpose for code tracing.
   */
  refreshPostCaptures(options?: { reason?: string }) {
    this.postCapturesUpdated$.next({ reason: options?.reason });
  }
}

export interface DiaBackendAssetTransaction extends Tuple {
  readonly id: string;
  readonly sender: string;
  readonly receiver_email: string;
  readonly created_at: string;
  readonly fulfilled_at: string | null;
  readonly expired: boolean;
}

export interface DiaBackendAssetParsedMeta extends Tuple {
  readonly proof_hash: string;
  readonly mime_type?: MimeType;
  readonly capture_time?: number;
  readonly capture_device?: string;
  readonly capture_latitude?: string;
  readonly capture_longitude?: string;
}

export interface DiaBackendAsset extends Tuple {
  readonly id: string;
  readonly proof_hash: string;
  readonly is_original_owner: boolean;
  readonly owner: string;
  readonly owner_name: string;
  readonly asset_file: string;
  readonly asset_file_thumbnail: string;
  readonly information: Partial<SortedProofInformation>;
  readonly signature: OldSignature[];
  readonly sharable_copy: string;
  readonly source_transaction: DiaBackendAssetTransaction | null;
  readonly parsed_meta: DiaBackendAssetParsedMeta;
  readonly creator_name: string;
  readonly supporting_file: string | null;
  readonly source_type: 'original' | 'post_capture' | 'store';
}

export type AssetDownloadField =
  | 'asset_file'
  | 'asset_file_thumbnail'
  | 'sharable_copy';

type CreateAssetResponse = DiaBackendAsset;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DeleteAssetResponse {}

async function buildFormDataToCreateAsset(proof: Proof) {
  const formData = new FormData();

  const info = await getSortedProofInformation(proof);
  formData.set('meta', JSON.stringify(info));

  formData.set('signature', JSON.stringify(getOldSignatures(proof)));

  const fileBase64 = Object.keys(await proof.getAssets())[0];
  const mimeType = Object.values(proof.indexedAssets)[0].mimeType;
  formData.set(
    'asset_file',
    await base64ToBlob(fileBase64, mimeType),
    `proof.${toExtension(mimeType)}`
  );

  formData.set('asset_file_mime_type', mimeType);

  return formData;
}
