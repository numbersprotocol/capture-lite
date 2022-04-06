import { Injectable } from '@angular/core';
import { App, AppInfo } from '@capacitor/app';
import { isPlatform } from '@ionic/core';
import { defer } from 'rxjs';
import { map } from 'rxjs/operators';
import packageInfo from '../../../../package.json';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  readonly version$ = defer(async () => {
    let appInfo: AppInfo = { version: '', build: '', id: '', name: '' };
    if (isPlatform('hybrid')) appInfo = await App.getInfo();
    return appInfo;
  }).pipe(
    map(info => {
      if (info.version === '') return packageInfo.version;
      return info.version;
    })
  );
}
