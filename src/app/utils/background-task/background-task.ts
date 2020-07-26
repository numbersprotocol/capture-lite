import { Capacitor, Plugins } from '@capacitor/core';
import { Observable } from 'rxjs';

const { BackgroundTask } = Plugins;

export function subscribeInBackground(work$: Observable<any>) {
  if (Capacitor.isNative) {
    const taskId = BackgroundTask.beforeExit(() => {
      work$.subscribe(_ => BackgroundTask.finish({ taskId }));
    });
  } else {
    work$.subscribe();
  }
}
