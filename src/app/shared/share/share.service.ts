import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { TranslocoService } from '@ngneat/transloco';
import { catchError } from 'rxjs/operators';
import { urlToDownloadApp } from '../../utils/constants';
import { getAssetProfileForNSE } from '../../utils/url';
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
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly translocoService: TranslocoService
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
    return getAssetProfileForNSE(asset.id);
  }

  async shareReferralCode(referralCode: string) {
    const text = this.translocoService.translate(
      'invitation.useMyReferralCodeToSignUpForCaptureAppPassVerificationAndWeBothGetNumPointsReward',
      { referralCode: referralCode }
    );

    return Share.share({ text: text + '\n' + urlToDownloadApp });
  }
}
