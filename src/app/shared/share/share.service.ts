import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { concatMap, first, map } from 'rxjs/operators';
import { blobToBase64 } from '../../utils/encoding/encoding';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../dia-backend/asset/dia-backend-asset-repository.service';
import { MediaStore } from '../media/media-store/media-store.service';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  private readonly defaultMimetype = 'image/jpeg';
  private readonly defaultShareText = '#CaptureApp #OnlyTruePhotos';

  constructor(
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly mediaStore: MediaStore,
    private readonly httpClient: HttpClient
  ) {}

  async share(asset: DiaBackendAsset) {
    const dataUri = await this.getCaiFile(asset);
    const fileUrl = await this.createFileUrl(dataUri);
    return Share.share({
      text: this.defaultShareText,
      url: fileUrl,
    });
  }

  private async createFileUrl(dataUri: string) {
    const base64 = dataUri.split(',')[1];
    const index = await this.mediaStore.write(base64, this.defaultMimetype);
    return this.mediaStore.getUri(index);
  }

  private async getCaiFile(asset: DiaBackendAsset) {
    return this.diaBackendAssetRepository
      .fetchById$(asset.id)
      .pipe(
        first(),
        map(diaBackendAsset => diaBackendAsset.cai_file),
        concatMap(cai_file =>
          this.httpClient.get(cai_file, { responseType: 'blob' })
        ),
        concatMap(blobToBase64),
        map(imageBase64 => `data:image/jpeg;base64,${imageBase64}`)
      )
      .toPromise();
  }
}
