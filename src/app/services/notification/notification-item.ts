import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';

const { LocalNotifications } = Plugins;

export class NotificationItem {
  constructor(
    private readonly id: number,
    private readonly translocoService: TranslocoService
  ) {}

  async notify(title: string, body: string): Promise<NotificationItem> {
    // tslint:disable-next-line: no-console
    console.log(`${title}: ${body}`);

    await LocalNotifications.schedule({
      notifications: [{ title, body, id: this.id }],
    });
    return this;
  }

  async error(error: Error): Promise<NotificationItem> {
    console.error(error);

    await LocalNotifications.schedule({
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
    LocalNotifications.cancel({ notifications: [{ id: String(this.id) }] });
    return this;
  }
}
