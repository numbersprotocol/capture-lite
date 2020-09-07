import { Injectable } from '@angular/core';
import { CameraResultType, CameraSource, Plugins } from '@capacitor/core';
import { defer } from 'rxjs';
import { map } from 'rxjs/operators';

const { Camera } = Plugins;

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
}
