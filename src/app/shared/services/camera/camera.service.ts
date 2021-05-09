import { Inject, Injectable } from '@angular/core';
import {
  AppPlugin,
  CameraPhoto,
  CameraPlugin,
  CameraResultType,
  CameraSource,
} from '@capacitor/core';
import { Subject } from 'rxjs';
import { blobToBase64 } from '../../../utils/encoding/encoding';
import { fromExtension } from '../../../utils/mime-type';
import {
  APP_PLUGIN,
  CAMERA_PLUGIN,
} from '../../core/capacitor-plugins/capacitor-plugins.module';
import { Media } from '../capture/capture.service';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  private readonly killedCapturedPhotoEvent$ = new Subject<Media>();
  readonly restoreKilledCaptureEvent$ = this.killedCapturedPhotoEvent$.asObservable();

  constructor(
    @Inject(APP_PLUGIN)
    private readonly appPlugin: AppPlugin,
    @Inject(CAMERA_PLUGIN)
    private readonly cameraPlugin: CameraPlugin
  ) {
    this.appPlugin.addListener('appRestoredResult', appState => {
      if (
        appState.pluginId === 'Camera' &&
        appState.methodName === 'getPhoto' &&
        appState.success
      ) {
        const cameraPhoto = appState.data as CameraPhoto;
        this.killedCapturedPhotoEvent$.next(cameraPhotoToPhoto(cameraPhoto));
      }
    });
  }

  async takePhoto(): Promise<Media> {
    const cameraPhoto = await this.cameraPlugin.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 100,
      allowEditing: false,
    });
    return cameraPhotoToPhoto(cameraPhoto);
  }

  // eslint-disable-next-line class-methods-use-this
  async recordVideo(): Promise<Media> {
    return new Promise<Media>((resolve, reject) => {
      const inputElement = document.createElement('input');
      inputElement.accept = 'video/*';
      inputElement.type = 'file';
      inputElement.setAttribute('capture', 'environment');
      inputElement.onchange = event => {
        const file = (event.target as HTMLInputElement | null)?.files?.item(0);
        if (!file || file.type !== 'video/mp4')
          reject(new VideoRecordError(`File type: ${file?.type}`));
        else
          blobToBase64(file).then(base64 =>
            resolve({
              base64,
              mimeType: 'video/mp4',
            })
          );
      };
      inputElement.click();
    });
  }
}

function cameraPhotoToPhoto(cameraPhoto: CameraPhoto): Media {
  return {
    mimeType: fromExtension(cameraPhoto.format),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    base64: cameraPhoto.base64String!,
  };
}

export class VideoRecordError extends Error {
  readonly name = 'VideoRecordError';
}
