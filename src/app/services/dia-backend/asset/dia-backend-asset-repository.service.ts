import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { isEqual } from 'lodash';
import { BehaviorSubject, defer, forkJoin, merge, Observable } from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  map,
  pluck,
  single,
  tap,
} from 'rxjs/operators';
import { base64ToBlob } from '../../../utils/encoding/encoding';
import { toExtension } from '../../../utils/mime-type';
import { Database } from '../../database/database.service';
import { OnConflictStrategy, Tuple } from '../../database/table/table';
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

  private readonly fetchAllCacheTable = this.database.getTable<DiaBackendAsset>(
    `${DiaBackendAssetRepository.name}_fetchAllCache`
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly notificationService: NotificationService,
    private readonly translocoService: TranslocoService,
    private readonly database: Database
  ) {}

  refresh$() {
    return this.fetchAll$().pipe(single());
  }

  getAll$(): Observable<DiaBackendAsset[]> {
    return merge(this.fetchAll$(), this.fetchAllCacheTable.queryAll$()).pipe(
      distinctUntilChanged(isEqual)
    );
  }

  getById$(id: string) {
    return this.getAll$().pipe(
      map(assets => assets.find(asset => asset.id === id))
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
      tap(assets =>
        this.fetchAllCacheTable.insert(
          assets,
          OnConflictStrategy.REPLACE,
          (x, y) => x.id === y.id
        )
      ),
      tap(() => this._isFetching$.next(false)),
      catchError(() => defer(() => this.fetchAllCacheTable.queryAll()))
    );
  }

  async add(proof: Proof) {
    return this.notificationService.notifyOnGoing(
      this.createAsset$(proof),
      this.translocoService.translate('registeringProof'),
      this.translocoService.translate('message.registeringProof')
    );
  }

  private createAsset$(proof: Proof) {
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
