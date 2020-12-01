import {
  CameraPhoto,
  CameraResultType,
  CameraSource,
  Plugins,
} from '@capacitor/core';
import { fromExtension, MimeType } from './mime-type';

const { App, Camera } = Plugins;

export async function capture(): Promise<Photo> {
  const cameraPhoto = await Camera.getPhoto({
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera,
    quality: 100,
    allowEditing: false,
  });
  return {
    mimeType: fromExtension(cameraPhoto.format),
    // tslint:disable-next-line: no-non-null-assertion
    base64: cameraPhoto.base64String!,
  };
}

export async function restoreKilledCapture() {
  return new Promise<Photo>(resolve => {
    App.addListener('appRestoredResult', appState => {
      if (
        appState.pluginId === 'Camera' &&
        appState.methodName === 'getPhoto' &&
        appState.success
      ) {
        const cameraPhoto = appState.data as CameraPhoto;
        resolve({
          mimeType: fromExtension(cameraPhoto.format),
          // tslint:disable-next-line: no-non-null-assertion
          base64: cameraPhoto.base64String!,
        });
      }
    });
  });
}

interface Photo {
  mimeType: MimeType;
  base64: string;
}
