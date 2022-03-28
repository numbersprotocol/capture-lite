import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { catchError } from 'rxjs/operators';
import { getAssetProfileUrl } from '../../utils/url';
import { Share } from '@capacitor/share';
import { concatMap, first, map } from 'rxjs/operators';
import { blobToBase64 } from '../../utils/encoding/encoding';
import {
  DiaBackendAsset,
  DiaBackendAssetRepository,
} from '../dia-backend/asset/dia-backend-asset-repository.service';
import { ErrorService } from '../error/error.service';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  private readonly defaultShareText = '#CaptureApp #OnlyTruePhotos';

  constructor(
    private readonly errorService: ErrorService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository
  ) {}

  async share(asset: DiaBackendAsset) {
    return Share.share({
      text: this.defaultShareText,
      url: await this.setPublicAndGetLink(asset),
    });
  }

  private async setPublicAndGetLink(asset: DiaBackendAsset) {
    const formData = new FormData();
    formData.append('public_access', 'true');
    await this.diaBackendAssetRepository
      .updateCapture$(asset.id, formData)
      .pipe(catchError((err: unknown) => this.errorService.toastError$(err)))
      .toPromise();
    return getAssetProfileUrl(asset.id);
  }
}
