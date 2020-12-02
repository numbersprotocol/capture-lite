import { InjectionToken, NgModule } from '@angular/core';
import { GeolocationPlugin, Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

export const GEOLOCATION_PLUGIN = new InjectionToken<GeolocationPlugin>(
  'GEOLOCATION_PLUGIN'
);

@NgModule({
  providers: [{ provide: GEOLOCATION_PLUGIN, useValue: Geolocation }],
})
export class CapacitorPluginsModule {}
