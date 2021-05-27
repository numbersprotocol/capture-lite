import { Injectable } from '@angular/core';
import { DiaBackendAssetRepository } from '../dia-backend-asset-repository.service';
import { DiaBackendAssetDownloadingService } from '../downloading/dia-backend-downloading.service';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendAssetPrefetchingService {
  constructor(
    private readonly assetRepository: DiaBackendAssetRepository,
    private readonly downloadingService: DiaBackendAssetDownloadingService
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
      } = await this.assetRepository
        .fetchOriginallyOwned$({ offset: currentOffset, limit })
        .toPromise();

      if (diaBackendAssets.length === 0) {
        break;
      }
      await Promise.all(
        diaBackendAssets.map(async diaBackendAsset => {
          if (diaBackendAsset.source_transaction === null)
            await this.downloadingService.storeRemoteCapture(diaBackendAsset);
          currentCount += 1;
          onStored(currentCount, totalCount);
        })
      );
      currentOffset += diaBackendAssets.length;
    }
  }
}
