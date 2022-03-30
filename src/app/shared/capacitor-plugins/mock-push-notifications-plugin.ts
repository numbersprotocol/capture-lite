/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
import { PluginListenerHandle } from '@capacitor/core';
import {
  ActionPerformed as PushNotificationActionPerformed,
  Channel as NotificationChannel,
  DeliveredNotifications as PushNotificationDeliveredList,
  ListChannelsResult as NotificationChannelList,
  PermissionStatus,
  PushNotificationSchema as PushNotification,
  PushNotificationsPlugin,
  Token as PushNotificationToken,
} from '@capacitor/push-notifications';

export class MockPushNotificationsPlugin implements PushNotificationsPlugin {
  async checkPermissions(): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }

  async register(): Promise<void> {
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

  addListener(
    eventName: 'registration',
    listenerFunc: (token: PushNotificationToken) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    eventName: 'registrationError',
    listenerFunc: (error: any) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    eventName: 'pushNotificationReceived',
    listenerFunc: (notification: PushNotification) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    eventName: 'pushNotificationActionPerformed',
    listenerFunc: (notification: PushNotificationActionPerformed) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    _eventName: any,
    _listenerFunc: any
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    // return { remove: () => {} };
    throw new Error('Method not implemented.');
  }

  async removeAllListeners(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
