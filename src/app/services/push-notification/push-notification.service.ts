import { Injectable } from '@angular/core';
import {
  Capacitor,
  Plugins,
  PushNotification,
  PushNotificationToken,
} from '@capacitor/core';
import { defer } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';
import { NumbersStorageApi } from '../publisher/numbers-storage/numbers-storage-api.service';

const { Device, PushNotifications } = Plugins;

/**
 * TODO: Refactor this class. Decouple from DIA Backend.
 */

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  constructor(
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly notificationService: NotificationService
  ) {}

  configure(): void {
    if (Capacitor.platform === 'web') {
      return;
    }
    this.requestPermission();
    this.addRegisterListener(
      token => {
        this.uploadToken$(token.value).subscribe(() =>
          // tslint:disable-next-line: no-console
          console.log(`token ${token.value} uploaded`)
        );
        const message = `Push registration success, token: ${token.value}`;
        // tslint:disable-next-line: no-console
        console.log(message);
      },
      error => {
        this.notificationService.error(error);
      }
    );
  }

  private uploadToken$(token: string) {
    return defer(() => Device.getInfo()).pipe(
      concatMap(deviceInfo =>
        this.numbersStorageApi.createOrUpdateDevice$(
          deviceInfo.platform,
          deviceInfo.uuid,
          token
        )
      ),
      // tslint:disable-next-line: no-console
      tap(() => console.log('Token Uploaded!'))
    );
  }

  // tslint:disable-next-line: prefer-function-over-method
  private requestPermission(): void {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermission().then(result => {
      if (result.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        throw Error('Failed to request permission');
      }
    });
  }

  // tslint:disable-next-line: prefer-function-over-method
  private addRegisterListener(
    onSuccess: (token: PushNotificationToken) => void,
    onError: (error: any) => void
  ): void {
    PushNotifications.addListener('registration', onSuccess);
    PushNotifications.addListener('registrationError', onError);
  }

  // tslint:disable-next-line: prefer-function-over-method
  private addReceivedListener(
    callback: (notification: PushNotification) => void
  ): void {
    PushNotifications.addListener('pushNotificationReceived', callback);
  }
}

interface NumbersStorageNotification {
  app_message_type:
    | 'transaction_received'
    | 'transaction_accepted'
    | 'transaction_expired';
}
