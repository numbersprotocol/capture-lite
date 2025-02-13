import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { TranslocoService } from '@ngneat/transloco';
import { catchError } from 'rxjs/operators';
import { urlToDownloadApp } from '../../utils/constants';
import { getCapturePage } from '../../utils/url';
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

  static async canShare() {
    return (await Share.canShare()).value;
  }

  static async shareShowcasePage(url: string) {
    return Share.share({ text: url });
  }

  async share(asset: DiaBackendAsset) {
    return Share.share({
      text: this.defaultShareText,
      url: await this.setPublicAndGetLink(asset),
    });
  }

  private async setPublicAndGetLink(asset: DiaBackendAsset) {
    if (!asset.public_access) {
      const formData = new FormData();
      formData.append('public_access', 'true');
      await this.diaBackendAssetRepository
        .updateCapture$(asset.id, formData)
        .pipe(catchError((err: unknown) => this.errorService.toastError$(err)))
        .toPromise();
    }
    return getCapturePage(asset);
  }

  async shareReferralCode(referralCode: string) {
    const text = this.translocoService.translate(
      'invitation.useMyReferralCodeToSignUpForCaptureCamPassVerificationAndWeBothGetNumCreditsReward',
      { referralCode: referralCode }
    );

    return Share.share({ text: text + '\n' + urlToDownloadApp });
  }
}
