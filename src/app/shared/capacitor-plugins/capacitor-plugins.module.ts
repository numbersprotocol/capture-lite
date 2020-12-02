import { InjectionToken, NgModule } from '@angular/core';
import { FilesystemPlugin, GeolocationPlugin, Plugins } from '@capacitor/core';

const { Filesystem, Geolocation } = Plugins;

export const GEOLOCATION_PLUGIN = new InjectionToken<GeolocationPlugin>(
  'GEOLOCATION_PLUGIN'
);

export const FILESYSTEM_PLUGIN = new InjectionToken<FilesystemPlugin>(
  'FILESYSTEM_PLUGIN'
);

@NgModule({
  providers: [
    { provide: GEOLOCATION_PLUGIN, useValue: Geolocation },
    { provide: FILESYSTEM_PLUGIN, useValue: Filesystem },
  ],
})
export class CapacitorPluginsModule {}
