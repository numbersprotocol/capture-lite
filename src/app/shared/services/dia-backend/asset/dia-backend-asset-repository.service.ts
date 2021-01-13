import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { BehaviorSubject, defer, forkJoin } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  pluck,
  single,
  tap,
} from 'rxjs/operators';
import { base64ToBlob } from '../../../../utils/encoding/encoding';
import { toExtension } from '../../../../utils/mime-type';
import { Tuple } from '../../database/table/table';
import { NotificationService } from '../../notification/notification.service';
import {
  getOldSignatures,
  getSortedProofInformation,
  OldSignature,
  SortedProofInformation,
} from '../../repositories/proof/old-proof-adapter';
import { Proof } from '../../repositories/proof/proof';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
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
    private readonly authService: DiaBackendAuthService,
    private readonly notificationService: NotificationService,
    private readonly translocoService: TranslocoService
  ) {}

  refresh$() {
    return this.fetchAll$().pipe(single());
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

  private fetchAll$() {
    return defer(async () => this._isFetching$.next(true)).pipe(
      concatMapTo(defer(() => this.authService.getAuthHeaders())),
      concatMap(headers =>
        this.httpClient.get<ListAssetResponse>(`${BASE_URL}/api/v2/assets/`, {
          headers,
        })
      ),
      pluck('results'),
      tap(() => this._isFetching$.next(false))
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
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.delete<DeleteAssetResponse>(
          `${BASE_URL}/api/v2/assets/${asset.id}/`,
          { headers }
        )
      )
    );
  }
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
}

interface ListAssetResponse {
  results: DiaBackendAsset[];
}

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
