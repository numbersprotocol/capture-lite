import { Injectable } from '@angular/core';
import { CameraResultType, CameraSource, Plugins } from '@capacitor/core';
import { defer } from 'rxjs';

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
    }));
  }
}
