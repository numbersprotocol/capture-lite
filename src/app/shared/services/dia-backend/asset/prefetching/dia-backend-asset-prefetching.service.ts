import { Injectable } from '@angular/core';
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
export class DiaBackendAssetPrefetchingService {
  constructor(
    private readonly imageStore: ImageStore,
    private readonly proofRepository: ProofRepository,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository
  ) {}

  async prefetch() {
    let currentOffset = 0;
    const limit = 100;
    while (true) {
      const diaBackendAssets = await this.diaBackendAssetRepository
        .fetchAllOriginallyOwned$(currentOffset, limit)
        .toPromise();
      console.log(diaBackendAssets.length);

      if (diaBackendAssets.length === 0) {
        break;
      }
      await Promise.all(
        diaBackendAssets.map(async diaBackendAsset => {
          await this.storeAssetThumbnail(diaBackendAsset);
          console.log(`thumbnail stored: ${diaBackendAsset.id}`);
          await this.storeIndexedProof(diaBackendAsset);
          console.log(`indexed proof stored: ${diaBackendAsset.id}`);
        })
      );
      currentOffset += diaBackendAssets.length;
    }
  }

  private async storeAssetThumbnail(diaBackendAsset: DiaBackendAsset) {
    if (!diaBackendAsset.information.proof) {
      return;
    }
    const thumbnailBlob = await this.diaBackendAssetRepository
      .downloadFile$(diaBackendAsset.id, 'asset_file_thumbnail')
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
    return this.proofRepository.add(proof, OnConflictStrategy.REPLACE);
  }
}
