import { NgModule } from '@angular/core';
import {
  FILESYSTEM_PLUGIN,
  GEOLOCATION_PLUGIN,
  LOCAL_NOTIFICATIONS_PLUGIN,
  STORAGE_PLUGIN,
} from './capacitor-plugins.module';
import { MockFilesystemPlugin } from './mock-filesystem-plugin';
import { MockGeolocationPlugin } from './mock-geolocation-plugin';
import { MockLocalNotificationsPlugin } from './mock-local-notifications-plugin';
import { MockStoragePlugin } from './mock-storage-plugin';

@NgModule({
  providers: [
    {
      provide: GEOLOCATION_PLUGIN,
      useClass: MockGeolocationPlugin,
    },
    {
      provide: FILESYSTEM_PLUGIN,
      useClass: MockFilesystemPlugin,
    },
    {
      provide: LOCAL_NOTIFICATIONS_PLUGIN,
      useClass: MockLocalNotificationsPlugin,
    },
    {
      provide: STORAGE_PLUGIN,
      useClass: MockStoragePlugin,
    },
  ],
})
export class CapacitorPluginsTestingModule {}
