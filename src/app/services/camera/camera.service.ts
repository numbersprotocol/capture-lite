import { Injectable } from '@angular/core';
import { AppRestoredResult, CameraPhoto, CameraResultType, CameraSource, Plugins } from '@capacitor/core';
import { defer, fromEventPattern } from 'rxjs';
import { filter, map } from 'rxjs/operators';

const { App, Camera } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  capture$() {
    return defer(() => Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 100,
      allowEditing: false
    })).pipe(
      map(cameraPhoto => ({
        format: cameraPhoto.format,
        // tslint:disable-next-line: no-non-null-assertion
        base64String: cameraPhoto.base64String!
      }))
    );
  }

  restoreKilledAppResult$() {
    const appRestored$ = fromEventPattern<AppRestoredResult>(
      handler => App.addListener('appRestoredResult', handler)
    );
    return appRestored$.pipe(
      filter(result => result.pluginId === 'Camera' && result.methodName === 'getPhoto' && result.success),
      map(result => result.data as CameraPhoto),
      map(cameraPhoto => ({
        format: cameraPhoto.format,
        // tslint:disable-next-line: no-non-null-assertion
        base64String: cameraPhoto.base64String!
      }))
    );
  }
}
