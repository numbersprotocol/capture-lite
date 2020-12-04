import { Inject } from '@angular/core';
import { LocalNotificationsPlugin } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { LOCAL_NOTIFICATIONS_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';

export class NotificationItem {
  constructor(
    private readonly id: number,
    @Inject(LOCAL_NOTIFICATIONS_PLUGIN)
    private readonly localNotificationsPlugin: LocalNotificationsPlugin,
    private readonly translocoService: TranslocoService
  ) {}

  async notify(title: string, body: string): Promise<NotificationItem> {
    console.info(`${title}: ${body}`);

    await this.localNotificationsPlugin.schedule({
      notifications: [{ title, body, id: this.id }],
    });
    return this;
  }

  async error(error: Error): Promise<NotificationItem> {
    console.error(error);

    await this.localNotificationsPlugin.schedule({
      notifications: [
        {
          title: this.translocoService.translate('unknownError'),
          body: JSON.stringify(error),
          id: this.id,
        },
      ],
    });
    return this;
  }

  async cancel(): Promise<NotificationItem> {
    this.localNotificationsPlugin.cancel({
      notifications: [{ id: String(this.id) }],
    });
    return this;
  }
}
