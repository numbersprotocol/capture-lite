import { NgModule } from '@angular/core';
import {
  APP_PLUGIN,
  CAMERA_PLUGIN,
  FILESYSTEM_PLUGIN,
  GEOLOCATION_PLUGIN,
  LOCAL_NOTIFICATIONS_PLUGIN,
  PUSH_NOTIFICATIONS_PLUGIN,
  STORAGE_PLUGIN,
} from './capacitor-plugins.module';
import { MockAppPlugin } from './mock-app-plugin';
import { MockCameraPlugin } from './mock-camera-plugin';
import { MockFilesystemPlugin } from './mock-filesystem-plugin';
import { MockGeolocationPlugin } from './mock-geolocation-plugin';
import { MockLocalNotificationsPlugin } from './mock-local-notifications-plugin';
import { MockPushNotificationsPlugin } from './mock-push-notifications-plugin';
import { MockStoragePlugin } from './mock-storage-plugin';

@NgModule({
  providers: [
    {
      provide: APP_PLUGIN,
      useClass: MockAppPlugin,
    },
    {
      provide: CAMERA_PLUGIN,
      useClass: MockCameraPlugin,
    },
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
    {
      provide: PUSH_NOTIFICATIONS_PLUGIN,
      useClass: MockPushNotificationsPlugin,
    },
  ],
})
export class CapacitorPluginsTestingModule {}
