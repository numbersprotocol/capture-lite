import { Inject, Injectable } from '@angular/core';
import { Capacitor, PushNotificationsPlugin } from '@capacitor/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PUSH_NOTIFICATIONS_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';
import { isNonNullable } from '../../utils/rx-operators';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  // tslint:disable-next-line: rxjs-no-explicit-generics
  private readonly token$ = new BehaviorSubject<string | undefined>(undefined);
  private readonly pushData$ = new Subject<{ [key: string]: string }>();

  constructor(
    @Inject(PUSH_NOTIFICATIONS_PLUGIN)
    private readonly pushNotificationsPlugin: PushNotificationsPlugin
  ) {
    if (Capacitor.isPluginAvailable('PushNotifications')) {
      this.pushNotificationsPlugin.addListener(
        'pushNotificationReceived',
        notification => {
          this.pushData$.next(notification.data);
        }
      );
    }
  }

  getToken$() {
    return this.token$.asObservable().pipe(isNonNullable());
  }

  getPushData$() {
    return this.pushData$.asObservable();
  }

  async register() {
    if (!Capacitor.isPluginAvailable('PushNotifications')) {
      return;
    }
    const result = await this.pushNotificationsPlugin.requestPermission();

    return new Promise<string>((resolve, reject) => {
      if (!result.granted) {
        reject(new Error('Push notification permission denied.'));
      }
      this.pushNotificationsPlugin.addListener('registration', token => {
        this.token$.next(token.value);
        resolve(token.value);
      });
      this.pushNotificationsPlugin.addListener('registrationError', reject);
      this.pushNotificationsPlugin.register();
    });
  }
}
