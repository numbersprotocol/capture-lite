import { Inject } from '@angular/core';
import { LocalNotification, LocalNotificationsPlugin } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { LOCAL_NOTIFICATIONS_PLUGIN } from '../capacitor-plugins/capacitor-plugins.module';

export class NotificationItem {
  constructor(
    private readonly id: number,
    @Inject(LOCAL_NOTIFICATIONS_PLUGIN)
    private readonly localNotificationsPlugin: LocalNotificationsPlugin,
    private readonly translocoService: TranslocoService
  ) {}

  async notify(title: string, body: string) {
    // eslint-disable-next-line no-console
    console.log(`${title}: ${body}`);
    return this.schedule({ id: this.id, title, body });
  }

  private async schedule(options: LocalNotification) {
    await this.localNotificationsPlugin.schedule({
      notifications: [options],
    });
    return this;
  }
}
