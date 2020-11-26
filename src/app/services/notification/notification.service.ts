import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { defer } from 'rxjs';
import { subscribeInBackground } from 'src/app/utils/background-task/background-task';

const { LocalNotifications } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private currentId = 1;

  constructor(
    private readonly translocoService: TranslocoService
  ) {
    LocalNotifications.requestPermission()
      .then(result => console.log(`Notification permission request result: ${result.granted}`));
  }

  createNotificationId() {
    this.currentId++;
    return this.currentId;
  }

  notify(id: number, title: string, body: string) {
    console.log(`${title}: ${body}`);
    subscribeInBackground(defer(() => LocalNotifications.schedule({
      notifications: [{ title, body, id }]
    })));
  }

  notifyError(id: number, error: Error) {
    this.notify(id, this.translocoService.translate('unknownError'), JSON.stringify(error));
  }

  cancel(id: number) {
    subscribeInBackground(defer(() => LocalNotifications.cancel({ notifications: [{ id: String(id) }] })));
  }
}
