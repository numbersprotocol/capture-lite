import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@ngneat/transloco';
import { isEqual } from 'lodash';
import {
  BehaviorSubject,
  defer,
  EMPTY,
  forkJoin,
  from,
  iif,
  merge,
  Observable,
  of,
} from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  delay,
  distinctUntilChanged,
  first,
  map,
  mapTo,
  pluck,
  single,
  tap,
  toArray,
} from 'rxjs/operators';
import { base64ToBlob } from '../../../utils/encoding/encoding';
import { switchTap, VOID$ } from '../../../utils/rx-operators/rx-operators';
import { Database } from '../../database/database.service';
import { OnConflictStrategy, Tuple } from '../../database/table/table';
import { ImageStore } from '../../image-store/image-store.service';
import { NotificationService } from '../../notification/notification.service';
import {
  getOldProof,
  getOldSignatures,
  getProof,
  getSortedProofInformation,
  OldSignature,
  SortedProofInformation,
} from '../../repositories/proof/old-proof-adapter';
import { Proof } from '../../repositories/proof/proof';
import { ProofRepository } from '../../repositories/proof/proof-repository.service';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendAssetRepository {
  private readonly table = this.database.getTable<DiaBackendAsset>(
    DiaBackendAssetRepository.name
  );
  private readonly _isFetching$ = new BehaviorSubject(false);
  private isDirty = true;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly database: Database,
    private readonly notificationService: NotificationService,
    private readonly translocoService: TranslocoService,
    private readonly proofRepository: ProofRepository,
    private readonly imageStore: ImageStore,
    private readonly snackbar: MatSnackBar
  ) {}

  getAll$() {
    return iif(
      () => !this.isDirty,
      this.table.queryAll$(),
      merge(this.fetchAll$(), this.table.queryAll$()).pipe(
        distinctUntilChanged((assetsX, assetsY) =>
          isEqual(
            assetsX.map(x => x.id),
            assetsY.map(y => y.id)
          )
        )
      )
    );
  }

  getById$(id: string) {
    return this.getAll$().pipe(
      map(assets => assets.find(asset => asset.id === id))
    );
  }

  isFetching$() {
    return this._isFetching$.asObservable();
  }

  refresh$() {
    return this.fetchAll$().pipe(single());
  }

  private fetchAll$(): Observable<DiaBackendAsset[]> {
    return defer(async () => {
      this.isDirty = false;
      return this._isFetching$.next(true);
    }).pipe(
      concatMapTo(defer(() => this.authService.getAuthHeaders())),
      concatMap(headers =>
        this.httpClient.get<ListAssetResponse>(`${BASE_URL}/api/v2/assets/`, {
          headers,
        })
      ),
      pluck('results'),
      concatMap(assets =>
        this.table.insert(
          assets,
          OnConflictStrategy.REPLACE,
          (x, y) => x.id === y.id
        )
      ),
      switchTap(assets => this.fetchProof$(assets)),
      tap(() => this._isFetching$.next(false)),
      catchError(() => EMPTY)
    );
  }

  private fetchProof$(assets: DiaBackendAsset[]) {
    const delayMillisBetweenAssets = 1000;
    return defer(() => this.proofRepository.getAll()).pipe(
      concatMap(proofs => {
        const notFetched = assets.filter(
          asset => !isProofFetched(asset, proofs)
        );
        // tslint:disable-next-line: no-console
        console.log(`${notFetched.length} assets has not synced.`);
        if (notFetched.length) {
          this.snackbar.open(
            this.translocoService.translate('message.syncingAssets'),
            this.translocoService.translate('dismiss'),
            { duration: 8000 }
          );
        }
        return from(notFetched);
      }),
      concatMap(asset => of(asset).pipe(delay(delayMillisBetweenAssets))),
      concatMap(asset =>
        this.downloadAsset$(asset).pipe(
          concatMap(raw =>
            getProof(this.imageStore, raw, asset.information, asset.signature)
          ),
          concatMap(proof =>
            this.proofRepository.add(proof, OnConflictStrategy.IGNORE)
          ),
          // tslint:disable-next-line: no-console
          tap(v => console.log(v.timestamp)),
          catchError(() => VOID$)
        )
      ),
      toArray()
    );
  }

  private downloadAsset$(asset: DiaBackendAsset) {
    const formData = new FormData();
    formData.set('field', 'asset_file');
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post(
          `${BASE_URL}/api/v2/assets/${asset.id}/download/`,
          formData,
          { headers, responseType: 'blob' }
        )
      )
    );
  }

  async add(proof: Proof) {
    return this.notificationService.notifyOnGoing(
      this._add$(proof),
      this.translocoService.translate('registeringProof'),
      this.translocoService.translate('message.registeringProof')
    );
  }

  private _add$(proof: Proof) {
    return this.createAsset$(proof).pipe(
      single(),
      concatMap(asset => this.table.insert([asset]))
    );
  }

  private createAsset$(proof: Proof) {
    return defer(async () => (this.isDirty = true)).pipe(
      concatMapTo(
        forkJoin([
          defer(() => this.authService.getAuthHeaders()),
          defer(() => buildFormDataToCreateAsset(proof)),
        ])
      ),
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
    return forkJoin([
      this.removeCache(asset),
      this.removeAsset$(asset).pipe(first()),
    ]).pipe(mapTo(asset));
  }

  private async removeCache(asset: DiaBackendAsset) {
    const all = await this.table.queryAll();
    return this.table.delete(all.filter(a => a.id === asset.id));
  }

  private removeAsset$(asset: DiaBackendAsset) {
    return defer(async () => {
      this.isDirty = true;
      return this.authService.getAuthHeaders();
    }).pipe(
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
  readonly asset_file: string;
  readonly information: SortedProofInformation;
  readonly signature: OldSignature[];
}

interface ListAssetResponse {
  results: DiaBackendAsset[];
}

// tslint:disable-next-line: no-empty-interface
interface CreateAssetResponse extends DiaBackendAsset {}

// tslint:disable-next-line: no-empty-interface
interface DeleteAssetResponse {}

function isProofFetched(asset: DiaBackendAsset, proofs: Proof[]) {
  return (
    proofs.find(proof => getOldProof(proof).hash === asset.proof_hash) !==
    undefined
  );
}

async function buildFormDataToCreateAsset(proof: Proof) {
  const formData = new FormData();

  const info = await getSortedProofInformation(proof);
  formData.set('meta', JSON.stringify(info));

  formData.set('signature', JSON.stringify(getOldSignatures(proof)));

  const fileBase64 = Object.keys(await proof.getAssets())[0];
  const mimeType = Object.values(proof.indexedAssets)[0].mimeType;
  formData.set('asset_file', await base64ToBlob(fileBase64, mimeType));

  formData.set('asset_file_mime_type', mimeType);

  return formData;
}
