import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { blobToBase64 } from '../../../../utils/encoding/encoding';
import { OnConflictStrategy } from '../../../database/table/table';
import { HttpErrorCode } from '../../../error/error.service';
import { MediaStore } from '../../../media/media-store/media-store.service';
import {
  getSignatures,
  getTruth,
} from '../../../repositories/proof/old-proof-adapter';
import { Proof } from '../../../repositories/proof/proof';
import { ProofRepository } from '../../../repositories/proof/proof-repository.service';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../dia-backend-asset-repository.service';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendAssetDownloadingService {
  constructor(
    private readonly assetRepository: DiaBackendAssetRepository,
    private readonly mediaStore: MediaStore,
    private readonly proofRepository: ProofRepository,
    private readonly httpClient: HttpClient
  ) {}

  async storeRemoteCapture(diaBackendAsset: DiaBackendAsset) {
    try {
      await this.storeAssetThumbnail(diaBackendAsset);
    } catch (e: unknown) {
      if (
        !(e instanceof HttpErrorResponse) ||
        !(e.status === HttpErrorCode.NOT_FOUND)
      )
        throw e;
    }
    return this.storeIndexedProof(diaBackendAsset);
  }

  private async storeAssetThumbnail(diaBackendAsset: DiaBackendAsset) {
    if (!diaBackendAsset.information.proof) {
      return;
    }
    // This function is only called by storeRemoteCapture, which should always
    // get diaBackendAsset from backend. That should mean we're always using
    // up-to-date asset_file_thumbnail cdn link.
    const thumbnailBlob = await this.httpClient
      .get(diaBackendAsset.asset_file_thumbnail, { responseType: 'blob' })
      .toPromise();
    return this.mediaStore.storeThumbnail(
      diaBackendAsset.proof_hash,
      await blobToBase64(thumbnailBlob),
      'image/jpeg'
    );
  }

  private async storeIndexedProof(diaBackendAsset: DiaBackendAsset) {
    if (
      !diaBackendAsset.information.proof ||
      !diaBackendAsset.information.information
    ) {
      return;
    }
    const proof = new Proof(
      this.mediaStore,
      getTruth({
        proof: diaBackendAsset.information.proof,
        information: diaBackendAsset.information.information,
      }),
      getSignatures(diaBackendAsset.signature)
    );
    proof.setIndexedAssets({
      [diaBackendAsset.proof_hash]: {
        mimeType: diaBackendAsset.information.proof.mimeType,
      },
    });
    proof.diaBackendAssetId = diaBackendAsset.id;
    if (diaBackendAsset.signed_metadata) proof.setSignatureVersion();
    return this.proofRepository.add(proof, OnConflictStrategy.REPLACE);
  }
}
