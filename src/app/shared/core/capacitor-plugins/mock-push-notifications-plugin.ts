/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
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
    _: PushNotificationDeliveredList
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async removeAllDeliveredNotifications(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async createChannel(_: NotificationChannel): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async deleteChannel(_: NotificationChannel): Promise<void> {
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
    _eventName:
      | 'registration'
      | 'registrationError'
      | 'pushNotificationReceived'
      | 'pushNotificationActionPerformed',
    _listenerFunc:
      | ((token: PushNotificationToken) => void)
      | ((error: any) => void)
      | ((notification: PushNotification) => void)
      | ((notification: PushNotificationActionPerformed) => void)
  ): PluginListenerHandle {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return { remove: () => {} };
  }

  removeAllListeners(): void {
    throw new Error('Method not implemented.');
  }
}
