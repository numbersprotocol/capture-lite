/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
import { PluginListenerHandle } from '@capacitor/core';
import {
  Channel as NotificationChannel,
  ListChannelsResult as NotificationChannelList,
  PermissionStatus,
  PushNotificationSchema as PushNotification,
  ActionPerformed as PushNotificationActionPerformed,
  DeliveredNotifications as PushNotificationDeliveredList,
  Token as PushNotificationToken,
  PushNotificationsPlugin,
} from '@capacitor/push-notifications';

export class MockPushNotificationsPlugin implements PushNotificationsPlugin {
  async checkPermissions(): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }

  async register(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async unregister(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async requestPermissions(): Promise<PermissionStatus> {
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

  async addListener(
    eventName: 'registration',
    listenerFunc: (token: PushNotificationToken) => void
  ): Promise<PluginListenerHandle>;
  async addListener(
    eventName: 'registrationError',
    listenerFunc: (error: any) => void
  ): Promise<PluginListenerHandle>;
  async addListener(
    eventName: 'pushNotificationReceived',
    listenerFunc: (notification: PushNotification) => void
  ): Promise<PluginListenerHandle>;
  async addListener(
    eventName: 'pushNotificationActionPerformed',
    listenerFunc: (notification: PushNotificationActionPerformed) => void
  ): Promise<PluginListenerHandle>;
  async addListener(
    _eventName: any,
    _listenerFunc: any
  ): Promise<PluginListenerHandle> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    // return { remove: () => {} };
    throw new Error('Method not implemented.');
  }

  async removeAllListeners(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
