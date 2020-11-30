import { Injectable } from '@angular/core';
import { NotificationPermissionResponse } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { NotificationItem } from './notification-item';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationTestingService extends NotificationService {
  constructor(translocoService: TranslocoService) {
    super(translocoService);
  }

  createNotification() {
    return new MockNotificationItem(
      this.getNewNotificationId(),
      this.translocoService
    );
  }

  async notify(title: string, body: string) {
    return this.createNotification().notify(title, body);
  }

  async error(error: Error) {
    return this.createNotification().error(error);
  }

  static async requestPermissions(): Promise<NotificationPermissionResponse> {
    return { granted: true };
  }
}

export class MockNotificationItem extends NotificationItem {
  constructor(id: number, translocoService: TranslocoService) {
    super(id, translocoService);
  }

  async notify(_title: string, _body: string): Promise<NotificationItem> {
    return this;
  }

  async error(_error: Error): Promise<NotificationItem> {
    return this;
  }

  async cancel(): Promise<NotificationItem> {
    return this;
  }
}
