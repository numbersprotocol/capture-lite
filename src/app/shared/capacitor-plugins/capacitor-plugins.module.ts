import { InjectionToken, NgModule } from '@angular/core';
import {
  FilesystemPlugin,
  GeolocationPlugin,
  LocalNotificationsPlugin,
  Plugins,
} from '@capacitor/core';

const { Filesystem, Geolocation, LocalNotifications } = Plugins;

export const GEOLOCATION_PLUGIN = new InjectionToken<GeolocationPlugin>(
  'GEOLOCATION_PLUGIN'
);
export const FILESYSTEM_PLUGIN = new InjectionToken<FilesystemPlugin>(
  'FILESYSTEM_PLUGIN'
);
export const LOCAL_NOTIFICATIONS_PLUGIN = new InjectionToken<LocalNotificationsPlugin>(
  'LOCAL_NOTIFICATIONS_PLUGIN'
);

@NgModule({
  providers: [
    { provide: GEOLOCATION_PLUGIN, useValue: Geolocation },
    { provide: FILESYSTEM_PLUGIN, useValue: Filesystem },
    { provide: LOCAL_NOTIFICATIONS_PLUGIN, useValue: LocalNotifications },
  ],
})
export class CapacitorPluginsModule {}
