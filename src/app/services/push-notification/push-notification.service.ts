import { Injectable } from '@angular/core';
import { Capacitor, Plugins, PushNotification, PushNotificationActionPerformed, PushNotificationToken } from '@capacitor/core';
import { NotificationService } from '../notification/notification.service';

const { PushNotifications } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor(
    private readonly notificationService: NotificationService,
  ) {
    this.configure();
  }

  private configure(): void {
    if (Capacitor.platform === 'web') {
      return;
    }
    this.requestPermission();
    this.addRegisterListener(
      (token) => { console.log(`Push registration success, token: ${token.value}`); },
      (error) => { throw Error(`Error on registration: ${JSON.stringify(error)}`); }
    );
    // Received -> when push notification received
    this.addReceivedListener((notification) => { console.log(`notification: ${notification}`); });
    // ActionPerformed -> when click on push notification
    this.addActionPerformedListener((notification) => { console.log(`notification: ${notification}`); });
  }

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

  private addRegisterListener(onSuccess: (token: PushNotificationToken) => void, onError: (error: any) => void): void {
    PushNotifications.addListener('registration', onSuccess);
    PushNotifications.addListener('registrationError', onError);
  }

  private addReceivedListener(callback: (notification: PushNotification) => void): void {
    PushNotifications.addListener('pushNotificationReceived', callback);
  }

  private addActionPerformedListener(callback: (notification: PushNotificationActionPerformed) => void): void {
    PushNotifications.addListener('pushNotificationActionPerformed', callback);
  }

}
