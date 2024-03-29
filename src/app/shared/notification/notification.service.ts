import { Inject, Injectable } from '@angular/core';
import { LocalNotificationsPlugin } from '@capacitor/local-notifications';
import { TranslocoService } from '@ngneat/transloco';
import { LOCAL_NOTIFICATIONS_PLUGIN } from '../capacitor-plugins/capacitor-plugins.module';
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
    return this.localNotificationsPlugin.requestPermissions();
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
}
