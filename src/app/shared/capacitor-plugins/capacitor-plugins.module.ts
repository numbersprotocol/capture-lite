import { InjectionToken, NgModule } from '@angular/core';
import {
  AppPlugin,
  CameraPlugin,
  FilesystemPlugin,
  GeolocationPlugin,
  LocalNotificationsPlugin,
  NetworkPlugin,
  Plugins,
  PushNotificationsPlugin,
} from '@capacitor/core';
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
      useValue: Plugins.App,
    },
    {
      provide: CAMERA_PLUGIN,
      useValue: Plugins.Camera,
    },
    {
      provide: GEOLOCATION_PLUGIN,
      useValue: Plugins.Geolocation,
    },
    {
      provide: FILESYSTEM_PLUGIN,
      useValue: Plugins.Filesystem,
    },
    {
      provide: LOCAL_NOTIFICATIONS_PLUGIN,
      useValue: Plugins.LocalNotifications,
    },
    {
      provide: NETOWRK_PLUGIN,
      useValue: Plugins.Network,
    },
    {
      provide: STORAGE_PLUGIN,
      useValue: Storage,
    },
    {
      provide: PUSH_NOTIFICATIONS_PLUGIN,
      useValue: Plugins.PushNotifications,
    },
  ],
})
export class CapacitorPluginsModule {}
