import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { defer } from 'rxjs';
import { subscribeInBackground } from '../../utils/background-task/background-task';

const { LocalNotifications } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private currentId = 1;

  constructor(private readonly translocoService: TranslocoService) {
    /**
     * TODO: Check if the notification permission is granted in constructor.
     */
  }

  createNotificationId() {
    this.currentId++;
    return this.currentId;
  }

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

  cancel(id: number) {
    subscribeInBackground(
      defer(() =>
        LocalNotifications.cancel({ notifications: [{ id: String(id) }] })
      )
    );
  }
}
