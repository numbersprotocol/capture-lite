import { Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalNotification, LocalNotificationsPlugin } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';
import { last } from 'rxjs/operators';
import { LOCAL_NOTIFICATIONS_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';

export class NotificationItem {
  constructor(
    private readonly id: number,
    @Inject(LOCAL_NOTIFICATIONS_PLUGIN)
    private readonly localNotificationsPlugin: LocalNotificationsPlugin,
    private readonly translocoService: TranslocoService,
    private readonly snackbar: MatSnackBar
  ) {}

  async notify(title: string, body: string) {
    console.info(`${title}: ${body}`);
    return this.schedule({ id: this.id, title, body });
  }

  async error(error: Error) {
    console.error(error);
    const message =
      error.message || this.translocoService.translate('unknownError');
    this.snackbar.open(message, this.translocoService.translate('dismiss'), {
      duration: 5000,
    });
    await this.schedule({
      id: this.id,
      title: this.translocoService.translate('.error'),
      body: message,
      ongoing: false,
    });
    return error;
  }

  async cancel() {
    this.localNotificationsPlugin.cancel({
      notifications: [{ id: String(this.id) }],
    });
    return this;
  }

  async notifyOnGoing<T>(action$: Observable<T>, title: string, body: string) {
    console.info(`${title}: ${body}`);
    const notification = await this.schedule({
      id: this.id,
      title,
      body,
      ongoing: true,
    });
    return new Promise<T>((resolve, reject) => {
      action$.pipe(last()).subscribe({
        next(value) {
          notification.cancel();
          resolve(value);
        },
        error(err) {
          notification.error(err);
          reject(err);
        },
      });
    });
  }

  private async schedule(options: LocalNotification) {
    await this.localNotificationsPlugin.schedule({
      notifications: [options],
    });
    return this;
  }
}
