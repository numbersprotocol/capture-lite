import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  ReplaySubject,
  Subject,
  defer,
  forkJoin,
  iif,
  merge,
  of,
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
import { base64ToBlob } from '../../../utils/encoding/encoding';
import { MimeType, toExtension } from '../../../utils/mime-type';
import { VOID$, isNonNullable } from '../../../utils/rx-operators/rx-operators';
import { CaptureAppWebCryptoApiSignatureProvider } from '../../collector/signature/capture-app-web-crypto-api-signature-provider/capture-app-web-crypto-api-signature-provider.service';
import { Tuple } from '../../database/table/table';
import {
  OldSignature,
  SortedProofInformation,
  getOldProof,
  getOldSignatures,
  getSortedProofInformation,
} from '../../repositories/proof/old-proof-adapter';
import {
  Proof,
  getSerializedSortedProofMetadata,
} from '../../repositories/proof/proof';
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

  readonly fetchOriginallyOwnedCount$ = this.list$({
    limit: 1,
    isOriginalOwner: true,
  }).pipe(pluck('count'));

  private readonly postCapturesCount$ = this.list$({
    limit: 1,
    orderBy: 'source_transaction',
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

  fetchOriginallyOwned$({
    limit,
    offset = 0,
  }: {
    limit: number;
    offset?: number;
  }) {
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
          `${BASE_URL}/api/v3/assets/`,
          { headers, params }
        );
      })
    );
  }

  private read$({ id }: { id: string }) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.get<DiaBackendAsset>(
          `${BASE_URL}/api/v3/assets/${id}/`,
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
          `${BASE_URL}/api/v3/assets/${id}/download/`,
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
          `${BASE_URL}/api/v3/assets/`,
          formData,
          { headers }
        )
      )
    );
  }

  updateCaptureSignature$(proof: Proof) {
    const update$ = forkJoin([
      defer(() => this.authService.getAuthHeaders()),
      defer(() => buildFormDataToUpdateSignature(proof)),
    ]).pipe(
      concatMap(([headers, formData]) =>
        this.httpClient.patch<UpdateAssetResponse>(
          `${BASE_URL}/api/v3/assets/${proof.diaBackendAssetId}/`,
          formData,
          { headers }
        )
      )
    );
    return defer(() =>
      iif(() => proof.diaBackendAssetId === undefined, VOID$, update$)
    );
  }

  updateCapture$(id: string, formData: any) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.patch<UpdateAssetResponse>(
          `${BASE_URL}/api/v3/assets/${id}/`,
          formData,
          { headers }
        )
      )
    );
  }

  createTemporaryShareToken$(id: string) {
    const formData = new FormData();
    const secondsInDay = 86400;
    formData.append('expiration_seconds', `${secondsInDay}`);
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post<CreateTmpShareTokenResponse>(
          `${BASE_URL}/api/v3/assets/${id}/private-share/`,
          formData,
          { headers }
        )
      ),
      map(response => response.tmp_token)
    );
  }

  removeCaptureById$(id: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.delete<DeleteAssetResponse>(
          `${BASE_URL}/api/v3/assets/${id}/`,
          { headers }
        )
      ),
      tap(() => this.refreshPostCaptures({ reason: 'removeCaptureById' }))
    );
  }

  /**
   * The reason argument is only for debugging purpose for code tracing.
   */
  refreshPostCaptures(options?: { reason?: string }) {
    this.postCapturesUpdated$.next({ reason: options?.reason });
  }

  mintNft$(id: string) {
    const formData = new FormData();
    formData.append('no_blocking', 'true');
    formData.append('nft_blockchain_name', 'thundercore');
    return defer(() => this.authService.getAuthHeadersWithApiKey()).pipe(
      concatMap(headers => {
        return this.httpClient.post(
          `${BASE_URL}/api/v3/assets/${id}/mint/`,
          formData,
          { headers }
        );
      })
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
  readonly capture_time?: number;
  readonly capture_device?: string;
  readonly capture_latitude?: string;
  readonly capture_longitude?: string;
}

export interface DiaBackendAsset extends Tuple {
  readonly id: string;
  readonly uuid: string;
  readonly cid: string;
  readonly proof_hash: string;
  readonly is_original_owner: boolean;
  readonly owner: string;
  readonly owner_name: string;
  readonly owner_addresses: OwnerAddresses;
  readonly asset_file: string;
  readonly asset_file_thumbnail: string;
  readonly asset_file_mime_type: MimeType;
  readonly information: Partial<SortedProofInformation>;
  readonly signature: OldSignature[];
  readonly signed_metadata: string;
  readonly sharable_copy: string;
  readonly source_transaction: DiaBackendAssetTransaction | null;
  readonly parsed_meta: DiaBackendAssetParsedMeta;
  readonly creator_name: string;
  readonly supporting_file: string | null;
  readonly source_type: 'original' | 'post_capture' | 'store';
  readonly cai_file: string;
  readonly nft_token_id: string | null;
  readonly nft_token_uri: string;
  readonly nft_blockchain_name: string;
  readonly nft_contract_address: string;
  readonly caption: string;
  readonly post_creation_workflow_id: string;
  readonly mint_workflow_id: string;
}

export interface OwnerAddresses extends Tuple {
  asset_wallet_address: string;
  managed_wallet_address: string;
}

export type AssetDownloadField =
  | 'asset_file'
  | 'asset_file_thumbnail'
  | 'sharable_copy';

type CreateAssetResponse = DiaBackendAsset;
type UpdateAssetResponse = DiaBackendAsset;

export interface CreateTmpShareTokenResponse extends Tuple {
  tmp_token: string;
  url: string;
  expiration_seconds: number;
  created_at: string;
  expired_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DeleteAssetResponse {}

async function buildFormDataToCreateAsset(proof: Proof) {
  const formData = new FormData();

  const info = await getSortedProofInformation(proof);
  const recorder = CaptureAppWebCryptoApiSignatureProvider.recorderFor(
    proof.cameraSource
  );
  const proofMetadata = await proof.generateProofMetadata(recorder);
  const serializedSortedProofMetadata =
    getSerializedSortedProofMetadata(proofMetadata);
  formData.set('meta', JSON.stringify(info));
  formData.set('signed_metadata', serializedSortedProofMetadata);
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

async function buildFormDataToUpdateSignature(proof: Proof) {
  const formData = new FormData();

  const recorder = CaptureAppWebCryptoApiSignatureProvider.recorderFor(
    proof.cameraSource
  );
  const ProofMetadata = await proof.generateProofMetadata(recorder);
  const serializedSortedProofMetadata =
    getSerializedSortedProofMetadata(ProofMetadata);
  formData.set('signed_metadata', serializedSortedProofMetadata);
  formData.set('signature', JSON.stringify(getOldSignatures(proof)));
  return formData;
}
