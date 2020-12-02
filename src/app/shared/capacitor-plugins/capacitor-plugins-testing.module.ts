import { NgModule } from '@angular/core';
import {
  FILESYSTEM_PLUGIN,
  GEOLOCATION_PLUGIN,
} from './capacitor-plugins.module';
import { MockFilesystemPlugin } from './mock-filesystem-plugin';
import { MockGeolocationPlugin } from './mock-geolocation-plugin';

@NgModule({
  providers: [
    { provide: GEOLOCATION_PLUGIN, useClass: MockGeolocationPlugin },
    { provide: FILESYSTEM_PLUGIN, useClass: MockFilesystemPlugin },
  ],
})
export class CapacitorPluginsTestingModule {}
