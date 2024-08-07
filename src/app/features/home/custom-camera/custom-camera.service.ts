import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { FilesystemPlugin } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { PreviewCamera } from '@numbersprotocol/preview-camera';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CameraService } from '../../../shared/camera/camera.service';
import { FILESYSTEM_PLUGIN } from '../../../shared/capacitor-plugins/capacitor-plugins.module';
import { CaptureService } from '../../../shared/capture/capture.service';
import { ErrorService } from '../../../shared/error/error.service';
import { PreferenceManager } from '../../../shared/preference-manager/preference-manager.service';
import {
  CustomCameraMediaItem,
  CustomCameraMediaType,
  CustomCameraMimeType,
} from './custom-camera';

@Injectable({
  providedIn: 'root',
})
export class CustomCameraService {
  private readonly preferences = this.preferenceManager.getPreferences(
    'CustomCameraService'
  );

  private readonly globalCSSClass = 'custom-camera-transparent-background';

  readonly isSaveToCameraRollEnabled$ = this.preferences
    .getString$(
      PrefKeys.SHOULD_SAVE_TO_CAMERA_ROLL,
      SaveToCameraRollDecision.UNDECIDED
    )
    .pipe(
      map(value => {
        const shouldSave = this.mapStringToSaveToCameraRollDecision(value);
        switch (shouldSave) {
          case SaveToCameraRollDecision.YES:
            return true;
          case SaveToCameraRollDecision.NO:
            return false;
          case SaveToCameraRollDecision.UNDECIDED:
            return false;
          default:
            return false;
        }
      })
    );

  uploadInProgress$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly httpClient: HttpClient,
    private readonly captureService: CaptureService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService,
    @Inject(FILESYSTEM_PLUGIN)
    private readonly filesystemPlugin: FilesystemPlugin,
    private readonly platform: Platform,
    private readonly cameraService: CameraService,
    private readonly preferenceManager: PreferenceManager
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

  // eslint-disable-next-line class-methods-use-this
  async saveCaptureToUserDevice(captureFilePath: string) {
    try {
      await PreviewCamera.saveFileToUserDevice({ filePath: captureFilePath });
    } catch (error: unknown) {
      /**
       * Several reasons might cause this error:
       * - User didn't grant permission to write.
       * - User has no storage.
       * - etc.
       * In the future report to crashlytics.
       */
      this.errorService.toastError$(error).subscribe();
    }
  }

  /**
   * Upload the captured media to the backend.
   *
   * @param filePath The file path of the captured media.
   * @param type The media type, either 'image' or 'video'.
   * @param source The source of the media capture, such as Camera or Photos (Gallery).
   */
  async uploadToCapture(
    filePath: string,
    type: CustomCameraMediaType,
    source: CameraSource
  ) {
    try {
      const readFileResult = await this.filesystemPlugin.readFile({
        path: filePath,
      });
      const base64 = readFileResult.data as string;

      const mimeType = type === 'image' ? 'image/jpeg' : 'video/mp4';

      await this.captureService.capture({ base64, mimeType, source });

      const shouldSaveFileToUserDevice =
        (await this.getShouldSaveToCameraRoll()) ===
        SaveToCameraRollDecision.YES;
      const fileNotFromGallery = source !== CameraSource.Photos;

      if (shouldSaveFileToUserDevice && fileNotFromGallery) {
        await this.saveCaptureToUserDevice(filePath);
      }

      await this.removeFile(filePath, source);
    } catch (error: unknown) {
      await this.handleUploadToCaptureError(error);
    }
  }

  private async handleUploadToCaptureError(error: unknown) {
    if (error instanceof Error && error.message.startsWith('Tuples existed')) {
      const translation = 'customCamera.error.duplicateAsset';
      const errorMsg = this.translocoService.translate(translation);
      await this.errorService.toastError$(errorMsg).toPromise();
    } else {
      const errMsg = this.translocoService.translate('error.unknownError');
      await this.errorService.toastError$(errMsg).toPromise();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async requestPermissions() {
    return PreviewCamera.requestPermissions();
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

  async pickImage() {
    return this.cameraService.pickPhoto();
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

  async removeFile(filePath: string | undefined, source: CameraSource) {
    if (!filePath) return;
    if (source === CameraSource.Photos) return; // Do not delete files picked from gallery
    await this.filesystemPlugin.deleteFile({ path: filePath });
  }

  async isTorchOn() {
    if (this.isNativePlatform) {
      return await PreviewCamera.isTorchOn();
    }
    return { result: false };
  }

  async enableTorch(enable: boolean): Promise<void> {
    if (this.isNativePlatform) {
      return await PreviewCamera.enableTorch({ enable });
    }
    return Promise.resolve();
  }

  async focus(x: number, y: number) {
    if (this.isNativePlatform) {
      return await PreviewCamera.focus({ x, y });
    }
    return Promise.resolve();
  }

  async minZoomFactor(): Promise<number> {
    const defaultMinAvailableZoom = 0;
    if (this.isNativePlatform) {
      return (await PreviewCamera.minAvailableZoom()).result;
    }
    return defaultMinAvailableZoom;
  }

  async maxZoomFactor(): Promise<number> {
    const defaultMaxAvailableZoom = 0;
    if (this.isNativePlatform) {
      let maxZoomFactor = (await PreviewCamera.maxAvailableZoom()).result;
      const sensitivityFactor = 4;
      if (maxZoomFactor > 0) {
        maxZoomFactor /= sensitivityFactor;
      }
      return maxZoomFactor;
    }
    return Promise.resolve(defaultMaxAvailableZoom);
  }

  async zoom(zoomFactor: any) {
    if (this.isNativePlatform) {
      return await PreviewCamera.zoom({ factor: zoomFactor });
    }
    return Promise.resolve();
  }

  async isTorchAvailable(): Promise<boolean> {
    if (this.isNativePlatform) {
      return (await PreviewCamera.isTorchAvailable()).result;
    }
    return false;
  }

  async setCameraQuality(quality: 'low' | 'hq'): Promise<void> {
    if (!this.isNativePlatform) return;

    await PreviewCamera.setQuality({ quality });
  }

  async shouldAskSaveToCameraRoll(): Promise<boolean> {
    const result = await this.getShouldSaveToCameraRoll();
    if (result === SaveToCameraRollDecision.UNDECIDED) return true;
    return false;
  }

  async getShouldSaveToCameraRoll(): Promise<SaveToCameraRollDecision> {
    const result = await this.preferences.getString(
      PrefKeys.SHOULD_SAVE_TO_CAMERA_ROLL,
      SaveToCameraRollDecision.UNDECIDED
    );
    return this.mapStringToSaveToCameraRollDecision(result);
  }

  async setShouldSaveToCameraRoll(value: SaveToCameraRollDecision) {
    return this.preferences.setString(
      PrefKeys.SHOULD_SAVE_TO_CAMERA_ROLL,
      value
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private mapStringToSaveToCameraRollDecision(
    value: string
  ): SaveToCameraRollDecision {
    switch (value) {
      case 'YES':
        return SaveToCameraRollDecision.YES;
      case 'NO':
        return SaveToCameraRollDecision.NO;
      default:
        return SaveToCameraRollDecision.UNDECIDED;
    }
  }

  private get isNativePlatform() {
    return this.platform.is('ios') || this.platform.is('android');
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

export const enum SaveToCameraRollDecision {
  UNDECIDED = 'UNDECIDED',
  YES = 'YES',
  NO = 'NO',
}

const enum PrefKeys {
  SHOULD_SAVE_TO_CAMERA_ROLL = 'SHOULD_SAVE_TO_CAMERA_ROLL',
}
