import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { NotificationItem } from './notification-item';

const { LocalNotifications } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  protected currentId = 1;

  constructor(protected readonly translocoService: TranslocoService) {}

  // tslint:disable-next-line: prefer-function-over-method
  async requestPermission() {
    return LocalNotifications.requestPermission();
  }

  createNotification() {
    return new NotificationItem(
      this.getNewNotificationId(),
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
}
