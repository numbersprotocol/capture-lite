import { Inject, Injectable } from '@angular/core';
import { LocalNotificationsPlugin } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';
import { LOCAL_NOTIFICATIONS_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';
import { NotificationItem } from './notification-item';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  protected currentId = 1;

  constructor(
    @Inject(LOCAL_NOTIFICATIONS_PLUGIN)
    private readonly localNotificationsPlugin: LocalNotificationsPlugin,
    private readonly translocoService: TranslocoService
  ) {}

  async requestPermission() {
    return this.localNotificationsPlugin.requestPermission();
  }

  createNotification() {
    return new NotificationItem(
      this.getNewNotificationId(),
      this.localNotificationsPlugin,
      this.translocoService
    );
  }

  protected getNewNotificationId() {
    this.currentId += 1;
    return this.currentId;
  }

  async notify(title: string, body: string) {
    return this.createNotification().notify(title, body);
  }

  async error(error: Error) {
    return this.createNotification().error(error);
  }

  async notifyOnGoing<T>(action$: Observable<T>, title: string, body: string) {
    return this.createNotification().notifyOnGoing(action$, title, body);
  }
}
