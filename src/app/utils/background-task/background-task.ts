import { Capacitor, Plugins } from '@capacitor/core';
import { Observable } from 'rxjs';

const { BackgroundTask } = Plugins;

export function subscribeInBackground(
  work$: Observable<any>,
  error?: (error: any) => void,
  complete?: () => void
) {
  if (Capacitor.isPluginAvailable('BackgroundTask')) {
    const taskId = BackgroundTask.beforeExit(() => {
      work$.subscribe(_ => BackgroundTask.finish({ taskId }), error, complete);
    });
  } else {
    work$.subscribe(_ => _, error, complete);
  }
}
