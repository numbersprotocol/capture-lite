import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { PreviewCamera } from '@numbersprotocol/preview-camera';
import { BehaviorSubject } from 'rxjs';
import { CaptureService } from '../../../shared/capture/capture.service';
import { ErrorService } from '../../../shared/error/error.service';
import { blobToBase64 } from '../../../utils/encoding/encoding';
import {
  CustomCameraMediaItem,
  CustomCameraMediaType,
  CustomCameraMimeType,
} from './custom-camera';

@Injectable({
  providedIn: 'root',
})
export class CustomCameraService {
  private readonly globalCSSClass = 'custom-camera-transparent-background';

  uploadInProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly httpClient: HttpClient,
    private readonly captureService: CaptureService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService
  ) {}

  private mediaItemFromFilePath(
    filePath: string,
    type: CustomCameraMediaType
  ): CustomCameraMediaItem {
    const src = Capacitor.convertFileSrc(filePath);
    const safeUrl = this.sanitizer.bypassSecurityTrustUrl(src);
    const mimeType: CustomCameraMimeType =
      type === 'image' ? 'image/jpeg' : 'video/mp4';
    const newItem = { filePath, src, safeUrl, type, mimeType };
    return newItem;
  }

  async uploadToCapture(filePath: string, type: CustomCameraMediaType) {
    const itemToUpload = this.mediaItemFromFilePath(filePath, type);

    try {
      const itemBlob = await this.httpClient
        .get(itemToUpload.src, { responseType: 'blob' })
        .toPromise();
      const base64 = await blobToBase64(itemBlob);
      const mimeType = itemToUpload.mimeType;
      await this.captureService.capture({ base64, mimeType });
    } catch (error) {
      const errMsg = this.translocoService.translate(`error.internetError`);
      await this.errorService.toastError$(errMsg).toPromise();
    }
  }

  async startPreviewCamera() {
    return PreviewCamera.startPreview()
      .then(this.changeGlobalCSSBackgroundToTransparent.bind(this))
      .catch(() => ({}));
  }

  async stopPreviewCamera() {
    this.changeGlobalCSSBackgroundToTransparentRevert();
    return PreviewCamera.stopPreview().catch(() => ({}));
  }

  // eslint-disable-next-line class-methods-use-this
  async flipCamera() {
    return PreviewCamera.flipCamera().catch(() => ({}));
  }

  // eslint-disable-next-line class-methods-use-this
  async takePhoto() {
    return PreviewCamera.takePhoto().catch(() => ({}));
  }

  // eslint-disable-next-line class-methods-use-this
  async startRecord() {
    return PreviewCamera.startRecord().catch(() => ({}));
  }

  // eslint-disable-next-line class-methods-use-this
  async stopRecord() {
    return PreviewCamera.stopRecord().catch(() => ({}));
  }

  private changeGlobalCSSBackgroundToTransparent() {
    document.querySelector('body')?.classList.add(this.globalCSSClass);
    document.querySelector('ion-app')?.classList.add(this.globalCSSClass);
  }

  private changeGlobalCSSBackgroundToTransparentRevert() {
    document.querySelector('body')?.classList.remove(this.globalCSSClass);
    document.querySelector('ion-app')?.classList.remove(this.globalCSSClass);
  }
}