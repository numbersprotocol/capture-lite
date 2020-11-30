import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { defer } from 'rxjs';
import { subscribeInBackground } from '../../utils/background-task/background-task';

const { LocalNotifications } = Plugins;

/**
 * 0. (TODO) Unit tests.
 * 1. (TODO) Create `Notification` instance to hold the id.
 * 2. (TODO) Simplify method to notify immediately without created `Notification` instance before.
 * 3. (TODO) Better error notification.
 */

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private currentId = 1;

  constructor(private readonly translocoService: TranslocoService) {
    /**
     * TODO: Check if the notification permission is granted in constructor.
     */
    LocalNotifications.requestPermission().then(result =>
      // tslint:disable-next-line: no-console
      console.log(`Notification permission request result: ${result.granted}`)
    );
  }

  createNotificationId() {
    this.currentId += 1;
    return this.currentId;
  }

  // TODO: Create new notification instance containing ID itself.
  // tslint:disable-next-line: prefer-function-over-method
  notify(id: number, title: string, body: string) {
    // tslint:disable-next-line: no-console
    console.log(`${title}: ${body}`);
    subscribeInBackground(
      defer(() =>
        LocalNotifications.schedule({
          notifications: [{ title, body, id }],
        })
      )
    );
  }

  notifyError(id: number, error: Error) {
    this.notify(
      id,
      this.translocoService.translate('unknownError'),
      JSON.stringify(error)
    );
  }

  // TODO: Create new notification instance containing ID itself.
  // tslint:disable-next-line: prefer-function-over-method
  cancel(id: number) {
    subscribeInBackground(
      defer(() =>
        LocalNotifications.cancel({ notifications: [{ id: String(id) }] })
      )
    );
  }
}
