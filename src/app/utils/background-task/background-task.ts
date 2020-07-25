import { Device, Plugins } from '@capacitor/core';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const { BackgroundTask } = Plugins;

export function subscribeInBackground(work$: Observable<any>) {
  defer(() => Device.getInfo()).pipe(
    map(info => {
      if (info.platform === 'electron' || info.platform === 'web') {
        work$.subscribe();
      } else {
        const taskId = BackgroundTask.beforeExit(() => {
          work$.subscribe(_ => BackgroundTask.finish({ taskId }));
        });
      }
    })
  ).subscribe();
}
