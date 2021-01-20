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

  async prefetch(
    onStored: (currentCount: number, totalCount: number) => any = () => void 0
  ) {
    let currentOffset = 0;
    let currentCount = 0;
    const limit = 100;
    while (true) {
      const {
        results: diaBackendAssets,
        count: totalCount,
      } = await this.diaBackendAssetRepository
        .fetchAllOriginallyOwned$(currentOffset, limit)
        .toPromise();

      if (diaBackendAssets.length === 0) {
        break;
      }
      await Promise.all(
        diaBackendAssets.map(async diaBackendAsset => {
          await this.storeAssetThumbnail(diaBackendAsset);
          await this.storeIndexedProof(diaBackendAsset);
          currentCount += 1;
          onStored(currentCount, totalCount);
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
    proof.diaBackendAssetId = diaBackendAsset.id;
    return this.proofRepository.add(proof, OnConflictStrategy.REPLACE);
  }
}
