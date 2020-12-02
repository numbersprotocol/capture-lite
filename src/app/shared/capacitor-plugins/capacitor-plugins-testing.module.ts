import { NgModule } from '@angular/core';
import { GEOLOCATION_PLUGIN } from './capacitor-plugins.module';
import { MockGeolocationPlugin } from './mock-geolocation-plugin';

@NgModule({
  providers: [{ provide: GEOLOCATION_PLUGIN, useClass: MockGeolocationPlugin }],
})
export class CapacitorPluginsTestingModule {}
