import { InjectionToken, NgModule } from '@angular/core';
import {
  AppPlugin,
  FilesystemPlugin,
  GeolocationPlugin,
  LocalNotificationsPlugin,
  Plugins,
  PushNotificationsPlugin,
  StoragePlugin,
} from '@capacitor/core';

const {
  App,
  Filesystem,
  Geolocation,
  LocalNotifications,
  Storage,
  PushNotifications,
} = Plugins;

export const APP_PLUGIN = new InjectionToken<AppPlugin>('APP_PLUGIN');
export const GEOLOCATION_PLUGIN = new InjectionToken<GeolocationPlugin>(
  'GEOLOCATION_PLUGIN'
);
export const FILESYSTEM_PLUGIN = new InjectionToken<FilesystemPlugin>(
  'FILESYSTEM_PLUGIN'
);
export const LOCAL_NOTIFICATIONS_PLUGIN = new InjectionToken<LocalNotificationsPlugin>(
  'LOCAL_NOTIFICATIONS_PLUGIN'
);
export const STORAGE_PLUGIN = new InjectionToken<StoragePlugin>(
  'STORAGE_PLUGIN'
);
export const PUSH_NOTIFICATIONS_PLUGIN = new InjectionToken<PushNotificationsPlugin>(
  'PUSH_NOTIFICATIONS_PLUGIN'
);

@NgModule({
  providers: [
    { provide: APP_PLUGIN, useValue: App },
    { provide: GEOLOCATION_PLUGIN, useValue: Geolocation },
    { provide: FILESYSTEM_PLUGIN, useValue: Filesystem },
    { provide: LOCAL_NOTIFICATIONS_PLUGIN, useValue: LocalNotifications },
    { provide: STORAGE_PLUGIN, useValue: Storage },
    { provide: PUSH_NOTIFICATIONS_PLUGIN, useValue: PushNotifications },
  ],
})
export class CapacitorPluginsModule {}
