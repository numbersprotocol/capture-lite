import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { defer } from 'rxjs';
import { map } from 'rxjs/operators';
import packageInfo from '../../../../package.json';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  readonly version$ = defer(() => App.getInfo()).pipe(
    map(info => {
      if (info.version === '') return packageInfo.version;
      return info.version;
    })
  );
}
