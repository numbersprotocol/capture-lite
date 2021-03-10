import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, forkJoin, iif } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  first,
  map,
  pluck,
  tap,
} from 'rxjs/operators';
import { base64ToBlob } from '../../../../utils/encoding/encoding';
import { toExtension } from '../../../../utils/mime-type';
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
import { PaginatedResponse } from '../pagination/paginated-response';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendAssetRepository {
  private readonly _isFetching$ = new BehaviorSubject(false);
  readonly isFetching$ = this._isFetching$
    .asObservable()
    .pipe(distinctUntilChanged());

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  async getCount() {
    return this.authService.getAuthHeaders$
      .pipe(
        concatMap(headers =>
          this.httpClient.get<PaginatedResponse<DiaBackendAsset>>(
            `${BASE_URL}/api/v2/assets/`,
            { headers, params: { is_original_owner: 'true' } }
          )
        ),
        pluck('count'),
        first()
      )
      .toPromise();
  }

  fetchById$(id: string) {
    return this.authService.getAuthHeaders$.pipe(
      concatMap(headers =>
        this.httpClient.get<DiaBackendAsset>(
          `${BASE_URL}/api/v2/assets/${id}/`,
          { headers }
        )
      )
    );
  }

  fetchByProof$(proof: Proof) {
    return defer(() => this.get$({ proofHash: getOldProof(proof).hash })).pipe(
      map(listAssetResponse =>
        listAssetResponse.count >= 0 ? listAssetResponse.results[0] : undefined
      )
    );
  }

  fetchPostCaptures$(pageSize?: number) {
    return iif(
      () => pageSize !== undefined,
      this.get$({
        limit: pageSize,
        isOriginalOwner: false,
        orderBy: 'source_transaction',
      }),
      this.get$({ isOriginalOwner: false, limit: 1 }).pipe(
        concatMap(response =>
          this.get$({
            isOriginalOwner: false,
            orderBy: 'source_transaction',
            limit: response.count,
          })
        )
      )
    );
  }

  fetchAllOriginallyOwned$(offset = 0, limit = 100) {
    return defer(async () => this._isFetching$.next(true)).pipe(
      concatMapTo(this.get$({ offset, limit, isOriginalOwner: true })),
      tap(() => this._isFetching$.next(false))
    );
  }

  fetchAllNotOriginallyOwned$(offset = 0, limit = 100) {
    return defer(async () => this._isFetching$.next(true)).pipe(
      concatMapTo(this.get$({ offset, limit, isOriginalOwner: false })),
      tap(() => this._isFetching$.next(false))
    );
  }

  private get$({
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

        if (offset) {
          params = params.set('offset', `${offset}`);
        }
        if (limit) {
          params = params.set('limit', `${limit}`);
        }
        if (isOriginalOwner) {
          params = params.set('is_original_owner', `${isOriginalOwner}`);
        }
        if (orderBy) {
          params = params.set('order_by', `${orderBy}`);
        }
        if (proofHash) {
          params = params.set('proof_hash', `${proofHash}`);
        }

        return this.httpClient.get<ListAssetResponse>(
          `${BASE_URL}/api/v2/assets/`,
          { headers, params }
        );
      })
    );
  }

  downloadFile$(id: string, field: AssetDownloadField) {
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

  add$(proof: Proof) {
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

  remove$(asset: DiaBackendAsset) {
    return this.removeById$(asset.id);
  }

  removeById$(id: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.delete<DeleteAssetResponse>(
          `${BASE_URL}/api/v2/assets/${id}/`,
          { headers }
        )
      )
    );
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
  readonly mime_type?: string;
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
  readonly asset_file: string;
  readonly asset_file_thumbnail: string;
  readonly information: Partial<SortedProofInformation>;
  readonly signature: OldSignature[];
  readonly sharable_copy: string;
  readonly source_transaction: DiaBackendAssetTransaction | null;
  readonly parsed_meta: DiaBackendAssetParsedMeta;
}

interface ListAssetResponse {
  count: number;
  results: DiaBackendAsset[];
}

export type AssetDownloadField =
  | 'asset_file'
  | 'asset_file_thumbnail'
  | 'sharable_copy';

type CreateAssetResponse = DiaBackendAsset;

// tslint:disable-next-line: no-empty-interface
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
