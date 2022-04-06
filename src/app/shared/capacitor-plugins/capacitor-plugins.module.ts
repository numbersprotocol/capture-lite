import { InjectionToken, NgModule } from '@angular/core';
import { App, AppPlugin } from '@capacitor/app';
import { Camera, CameraPlugin } from '@capacitor/camera';
import { Filesystem, FilesystemPlugin } from '@capacitor/filesystem';
import { Geolocation, GeolocationPlugin } from '@capacitor/geolocation';
import {
  LocalNotifications,
  LocalNotificationsPlugin,
} from '@capacitor/local-notifications';
import { Network, NetworkPlugin } from '@capacitor/network';
import {
  PushNotifications,
  PushNotificationsPlugin,
} from '@capacitor/push-notifications';
import { Storage, StoragePlugin } from '@capacitor/storage';

export const APP_PLUGIN = new InjectionToken<AppPlugin>('APP_PLUGIN');
export const CAMERA_PLUGIN = new InjectionToken<CameraPlugin>('CAMERA_PLUGIN');
export const GEOLOCATION_PLUGIN = new InjectionToken<GeolocationPlugin>(
  'GEOLOCATION_PLUGIN'
);
export const FILESYSTEM_PLUGIN = new InjectionToken<FilesystemPlugin>(
  'FILESYSTEM_PLUGIN'
);
export const LOCAL_NOTIFICATIONS_PLUGIN =
  new InjectionToken<LocalNotificationsPlugin>('LOCAL_NOTIFICATIONS_PLUGIN');
export const NETOWRK_PLUGIN = new InjectionToken<NetworkPlugin>(
  'NETWORK_PLUGIN'
);
export const STORAGE_PLUGIN = new InjectionToken<StoragePlugin>(
  'STORAGE_PLUGIN'
);
export const PUSH_NOTIFICATIONS_PLUGIN =
  new InjectionToken<PushNotificationsPlugin>('PUSH_NOTIFICATIONS_PLUGIN');

@NgModule({
  providers: [
    {
      provide: APP_PLUGIN,
      useValue: App,
    },
    {
      provide: CAMERA_PLUGIN,
      useValue: Camera,
    },
    {
      provide: GEOLOCATION_PLUGIN,
      useValue: Geolocation,
    },
    {
      provide: FILESYSTEM_PLUGIN,
      useValue: Filesystem,
    },
    {
      provide: LOCAL_NOTIFICATIONS_PLUGIN,
      useValue: LocalNotifications,
    },
    {
      provide: NETOWRK_PLUGIN,
      useValue: Network,
    },
    {
      provide: STORAGE_PLUGIN,
      useValue: Storage,
    },
    {
      provide: PUSH_NOTIFICATIONS_PLUGIN,
      useValue: PushNotifications,
    },
  ],
})
export class CapacitorPluginsModule {}
