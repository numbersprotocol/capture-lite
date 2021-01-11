// tslint:disable: prefer-function-over-method no-async-without-await
import {
  NotificationChannel,
  NotificationChannelList,
  NotificationPermissionResponse,
  PluginListenerHandle,
  PushNotification,
  PushNotificationActionPerformed,
  PushNotificationDeliveredList,
  PushNotificationsPlugin,
  PushNotificationToken,
} from '@capacitor/core';

export class MockPushNotificationsPlugin implements PushNotificationsPlugin {
  async register(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async requestPermission(): Promise<NotificationPermissionResponse> {
    throw new Error('Method not implemented.');
  }

  async getDeliveredNotifications(): Promise<PushNotificationDeliveredList> {
    throw new Error('Method not implemented.');
  }

  async removeDeliveredNotifications(
    delivered: PushNotificationDeliveredList
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async removeAllDeliveredNotifications(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async createChannel(channel: NotificationChannel): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async deleteChannel(channel: NotificationChannel): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async listChannels(): Promise<NotificationChannelList> {
    throw new Error('Method not implemented.');
  }

  addListener(
    eventName: 'registration',
    listenerFunc: (token: PushNotificationToken) => void
  ): PluginListenerHandle;
  addListener(
    eventName: 'registrationError',
    listenerFunc: (error: any) => void
  ): PluginListenerHandle;
  addListener(
    eventName: 'pushNotificationReceived',
    listenerFunc: (notification: PushNotification) => void
  ): PluginListenerHandle;
  addListener(
    eventName: 'pushNotificationActionPerformed',
    listenerFunc: (notification: PushNotificationActionPerformed) => void
  ): PluginListenerHandle;
  addListener(
    eventName:
      | 'registration'
      | 'registrationError'
      | 'pushNotificationReceived'
      | 'pushNotificationActionPerformed',
    listenerFunc:
      | ((token: PushNotificationToken) => void)
      | ((error: any) => void)
      | ((notification: PushNotification) => void)
      | ((notification: PushNotificationActionPerformed) => void)
  ): PluginListenerHandle {
    // tslint:disable-next-line: no-empty
    return { remove: () => {} };
  }

  removeAllListeners(): void {
    throw new Error('Method not implemented.');
  }
}
