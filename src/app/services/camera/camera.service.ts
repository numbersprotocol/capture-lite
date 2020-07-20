import { Injectable } from '@angular/core';
import { CameraResultType, CameraSource, Plugins } from '@capacitor/core';
import { defer } from 'rxjs';

const { Camera } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  // FIXME: Because the Camera API launches a separate Activity to handle taking the photo, you
  //        should listen for appRestoredResult in the App plugin to handle any camera data that was
  //        sent in the case your app was terminated by the operating system while the Activity was
  //        running. See: https://capacitorjs.com/docs/apis/app#android-use-apprestoredresult
  capture$() {
    return defer(() => Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 100,
      allowEditing: false
    }));
  }
}
