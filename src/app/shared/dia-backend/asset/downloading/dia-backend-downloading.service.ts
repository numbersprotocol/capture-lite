import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { blobToBase64 } from '../../../../utils/encoding/encoding';
import { OnConflictStrategy } from '../../../database/table/table';
import { HttpErrorCode } from '../../../error/error.service';
import { MediaStore } from '../../../media/media-store/media-store.service';
import {
  getSignatures,
  getTruth,
} from '../../../repositories/proof/old-proof-adapter';
import { Proof, Truth } from '../../../repositories/proof/proof';
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
    private readonly proofRepository: ProofRepository
  ) {}

  async storeRemoteCapture(
    diaBackendAsset: DiaBackendAsset,
    storeAssetThumbnail = true
  ) {
    if (storeAssetThumbnail) {
      try {
        await this.storeAssetThumbnail(diaBackendAsset);
      } catch (e: unknown) {
        if (
          !(e instanceof HttpErrorResponse) ||
          !(e.status === HttpErrorCode.NOT_FOUND)
        )
          throw e;
      }
    }
    return this.storeIndexedProof(diaBackendAsset);
  }

  private async storeAssetThumbnail(diaBackendAsset: DiaBackendAsset) {
    if (!diaBackendAsset.information.proof) {
      return;
    }
    const thumbnailBlob = await this.assetRepository
      .downloadFile$({ id: diaBackendAsset.id, field: 'asset_file_thumbnail' })
      .pipe(first())
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
    let truth: Truth;
    try {
      truth = getTruth({
        proof: diaBackendAsset.information.proof,
        information: diaBackendAsset.information.information,
      });
    } catch {
      return; // Skip storing proof without truth
    }

    const proof = new Proof(
      this.mediaStore,
      truth,
      getSignatures(diaBackendAsset.signature)
    );
    proof.setIndexedAssets({
      [diaBackendAsset.proof_hash]: {
        mimeType: diaBackendAsset.information.proof.mimeType,
      },
    });
    proof.diaBackendAssetId = diaBackendAsset.id;
    proof.caption = diaBackendAsset.caption;
    proof.uploadedAt = diaBackendAsset.uploaded_at;
    proof.parentAssetCid = diaBackendAsset.parent_asset_cid;
    if (diaBackendAsset.signed_metadata) proof.setSignatureVersion();
    return this.proofRepository.add(proof, OnConflictStrategy.REPLACE);
  }
}
