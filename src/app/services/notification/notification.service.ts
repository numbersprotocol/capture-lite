import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { defer } from 'rxjs';
import { subscribeInBackground } from 'src/app/utils/background-task/background-task';

const { LocalNotifications } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private currentId = 1;

  constructor() {
    LocalNotifications.requestPermission()
      .then(result => console.log(`Notification permission request result: ${result.granted}`));
  }

  createNotificationId() {
    this.currentId++;
    return this.currentId;
  }

  // TODO: Add on-going configurations when this PR got merged and released:
  //       https://github.com/ionic-team/capacitor/pull/3165
  notify(id: number, title: string, body: string) {
    subscribeInBackground(defer(() => LocalNotifications.schedule({
      notifications: [{ title, body, id }]
    })));
  }

  cancel(id: number) {
    subscribeInBackground(defer(() => LocalNotifications.cancel({ notifications: [{ id: String(id) }] })));
  }
}
