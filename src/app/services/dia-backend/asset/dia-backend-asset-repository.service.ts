import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { defer, forkJoin } from 'rxjs';
import { concatMap, single } from 'rxjs/operators';
import { base64ToBlob } from '../../../utils/encoding/encoding';
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
  private readonly table = this.database.getTable<DiaBackendAsset>(
    DiaBackendAssetRepository.name
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly database: Database,
    private readonly notificationService: NotificationService,
    private readonly translocoService: TranslocoService
  ) {}

  getAll$() {
    return this.table.queryAll$();
  }

  // TODO: use repository pattern to read locally.
  // NOTE: The DiaBackendAsset object is DIFFERENT between the one received from
  //       posting /api/v2/assets/ and getting /api/v2/assets/${id}/. This is a
  //       pitfall when you want to delete the existent one with another asset.
  getById$(id: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.get<DiaBackendAsset>(
          `${BASE_URL}/api/v2/assets/${id}/`,
          { headers }
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
    return forkJoin([
      defer(() => this.authService.getAuthHeaders()),
      defer(() => buildFormDataToCreateAsset(proof)),
    ]).pipe(
      concatMap(([headers, formData]) =>
        this.httpClient.post<DiaBackendAsset>(
          `${BASE_URL}/api/v2/assets/`,
          formData,
          { headers }
        )
      )
    );
  }

  // TODO: use repository to remove this method.
  async addAssetDirectly(
    assets: DiaBackendAsset[],
    onConflict = OnConflictStrategy.ABORT,
    comparator = (x: DiaBackendAsset, y: DiaBackendAsset) => x.id === y.id
  ) {
    return this.table.insert(assets, onConflict, comparator);
  }

  // TODO: use repository to remove this method.
  // NOTE: The DiaBackendAsset object is DIFFERENT between the one received from
  //       posting /api/v2/assets/ and getting /api/v2/assets/${id}/. This is a
  //       pitfall when you want to delete the existent one with another asset.
  //       You have to use ID as the primary key.
  async remove(asset: DiaBackendAsset) {
    const all = await this.table.queryAll();
    return this.table.delete(all.filter(a => a.id === asset.id));
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
