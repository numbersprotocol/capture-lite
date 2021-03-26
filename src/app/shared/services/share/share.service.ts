import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { concatMap, first, map } from 'rxjs/operators';
import { blobToBase64 } from '../../../utils/encoding/encoding';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../dia-backend/asset/dia-backend-asset-repository.service';
import { ImageStore } from '../image-store/image-store.service';
const { Share } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  private readonly defaultMimetype = 'image/jpeg';
  private readonly defaultShareText = '#CaptureApp #OnlyTruePhotos';

  constructor(
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly imageStore: ImageStore
  ) {}

  async share(asset: DiaBackendAsset) {
    const dataUri = await this.getSharableCopy(asset);
    const fileUrl = await this.createFileUrl(dataUri);
    return Share.share({
      text: this.defaultShareText,
      url: fileUrl,
    });
  }

  private async createFileUrl(dataUri: string) {
    const base64 = dataUri.split(',')[1];
    const index = await this.imageStore.write(base64, this.defaultMimetype);
    return this.imageStore.getUri(index);
  }

  private async getSharableCopy(asset: DiaBackendAsset) {
    return this.diaBackendAssetRepository
      .downloadFile$({ id: asset.id, field: 'sharable_copy' })
      .pipe(
        first(),
        concatMap(blobToBase64),
        map(imageBase64 => `data:image/jpeg;base64,${imageBase64}`)
      )
      .toPromise();
  }
}
