import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { defer } from 'rxjs';
import { map } from 'rxjs/operators';
import { version } from '../../../../../package.json';

const { Device } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  readonly version$ = defer(() => Device.getInfo()).pipe(
    map(info => {
      if (info.appVersion === '') return version;
      return info.appVersion;
    })
  );
}
