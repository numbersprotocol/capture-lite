/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */

import { PluginListenerHandle } from '@capacitor/core';
import {
  DeliveredNotifications,
  LocalNotificationSchema as LocalNotification,
  ActionPerformed as LocalNotificationActionPerformed,
  ActionType as LocalNotificationActionType,
  EnabledResult as LocalNotificationEnabledResult,
  PendingResult as LocalNotificationPendingList,
  ScheduleResult as LocalNotificationScheduleResult,
  LocalNotificationsPlugin,
  Channel as NotificationChannel,
  ListChannelsResult as NotificationChannelList,
  PermissionStatus,
  SettingsPermissionStatus,
} from '@capacitor/local-notifications';

export class MockLocalNotificationsPlugin implements LocalNotificationsPlugin {
  async schedule(options: {
    notifications: LocalNotification[];
  }): Promise<LocalNotificationScheduleResult> {
    return {
      notifications: options.notifications.map(notification => ({
        id: notification.id,
      })),
    };
  }

  async getPending(): Promise<LocalNotificationPendingList> {
    throw new Error('Method not implemented.');
  }

  async registerActionTypes(_: {
    types: LocalNotificationActionType[];
  }): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async cancel(_: LocalNotificationPendingList): Promise<void> {
    return;
  }

  async areEnabled(): Promise<LocalNotificationEnabledResult> {
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

  async checkPermissions(): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }

  async requestPermissions(): Promise<PermissionStatus> {
    return { display: 'granted' };
  }

  async changeExactNotificationSetting(): Promise<SettingsPermissionStatus> {
    throw new Error('Method not implemented.');
  }

  async checkExactNotificationSetting(): Promise<SettingsPermissionStatus> {
    throw new Error('Method not implemented.');
  }

  addListener(
    eventName: 'localNotificationReceived',
    listenerFunc: (notification: LocalNotification) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    eventName: 'localNotificationActionPerformed',
    listenerFunc: (notificationAction: LocalNotificationActionPerformed) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    _eventName: any,
    _listenerFunc: any
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
    throw new Error('Method not implemented.');
  }

  async removeAllListeners(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getDeliveredNotifications(): Promise<DeliveredNotifications> {
    throw new Error('Method not implemented.');
  }
  async removeDeliveredNotifications(_: DeliveredNotifications): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async removeAllDeliveredNotifications(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
