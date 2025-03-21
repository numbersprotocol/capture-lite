import { Inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotificationsPlugin } from '@capacitor/push-notifications';
import { BehaviorSubject, Subject } from 'rxjs';
import { isNonNullable } from '../../utils/rx-operators/rx-operators';
import { PUSH_NOTIFICATIONS_PLUGIN } from '../capacitor-plugins/capacitor-plugins.module';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
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
      this.pushNotificationsPlugin.addListener(
        'pushNotificationActionPerformed',
        notification => {
          this.pushData$.next(notification.notification.data);
        }
      );
    }
  }

  getToken$(filterNull = true) {
    const observable$ = this.token$.asObservable();
    return filterNull ? observable$.pipe(isNonNullable()) : observable$;
  }

  getPushData$() {
    return this.pushData$.asObservable();
  }

  async register() {
    if (!Capacitor.isPluginAvailable('PushNotifications')) {
      return;
    }
    const result = await this.pushNotificationsPlugin.requestPermissions();

    return new Promise<string>((resolve, reject) => {
      if (result.receive !== 'granted') {
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
