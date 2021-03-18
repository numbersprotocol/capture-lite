import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { blobToBase64 } from '../../../../../utils/encoding/encoding';
import { OnConflictStrategy } from '../../../database/table/table';
import { ImageStore } from '../../../image-store/image-store.service';
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
    private readonly imageStore: ImageStore,
    private readonly proofRepository: ProofRepository
  ) {}

  async storeRemoteCapture(diaBackendAsset: DiaBackendAsset) {
    await this.storeAssetThumbnail(diaBackendAsset);
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
    return this.imageStore.storeThumbnail(
      diaBackendAsset.proof_hash,
      await blobToBase64(thumbnailBlob),
      diaBackendAsset.information.proof.mimeType
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
      this.imageStore,
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
    return this.proofRepository.add(proof, OnConflictStrategy.REPLACE);
  }
}
