import { Inject, Injectable } from '@angular/core';
import { GeolocationPlugin, Plugins } from '@capacitor/core';
import { GEOLOCATION_PLUGIN } from '../../../../shared/capacitor-plugins/capacitor-plugins.module';
import { PreferenceManager } from '../../../preference-manager/preference-manager.service';
import {
  Assets,
  DefaultFactId,
  Facts,
} from '../../../repositories/proof/proof';
import { FactsProvider } from '../facts-provider';

const { Device } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class CapacitorFactsProvider implements FactsProvider {
  readonly id = CapacitorFactsProvider.name;
  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  constructor(
    @Inject(GEOLOCATION_PLUGIN)
    private readonly geolocationPlugin: GeolocationPlugin,
    private readonly preferenceManager: PreferenceManager
  ) {}

  async provide(_: Assets): Promise<Facts> {
    const deviceInfo = await this.collectDeviceInfo();
    const locationInfo = await this.collectLocationInfo();
    return {
      [DefaultFactId.DEVICE_NAME]: deviceInfo?.model,
      [DefaultFactId.GEOLOCATION_LATITUDE]: locationInfo?.coords.latitude,
      [DefaultFactId.GEOLOCATION_LONGITUDE]: locationInfo?.coords.longitude,
      UUID: deviceInfo?.uuid,
      PLATFORM: deviceInfo?.platform,
      OPERATING_SYSTEM: deviceInfo?.operatingSystem,
      OS_VERSION: deviceInfo?.osVersion,
    };
  }

  private async collectDeviceInfo() {
    const isDeviceInfoCollectionEnabled = await this.isDeviceInfoCollectionEnabled();
    if (!isDeviceInfoCollectionEnabled) {
      return;
    }
    return Device.getInfo();
  }

  private async collectLocationInfo() {
    const defaultGeolocationAge = 600000;
    const defaultGeolocationTimeout = 10000;
    const isLocationInfoCollectionEnabled = await this.isGeolocationInfoCollectionEnabled();
    if (!isLocationInfoCollectionEnabled) {
      return;
    }
    return this.geolocationPlugin.getCurrentPosition({
      enableHighAccuracy: true,
      maximumAge: defaultGeolocationAge,
      timeout: defaultGeolocationTimeout,
    });
  }

  isDeviceInfoCollectionEnabled$() {
    return this.preferences.getBoolean$(PrefKeys.COLLECT_DEVICE_INFO, true);
  }

  async isDeviceInfoCollectionEnabled() {
    return this.preferences.getBoolean(PrefKeys.COLLECT_DEVICE_INFO, true);
  }

  async setDeviceInfoCollection(enable: boolean) {
    return this.preferences.setBoolean(PrefKeys.COLLECT_DEVICE_INFO, enable);
  }

  isGeolocationInfoCollectionEnabled$() {
    return this.preferences.getBoolean$(PrefKeys.COLLECT_LOCATION_INFO, true);
  }

  async isGeolocationInfoCollectionEnabled() {
    return this.preferences.getBoolean(PrefKeys.COLLECT_LOCATION_INFO, true);
  }

  async setGeolocationInfoCollection(enable: boolean) {
    return this.preferences.setBoolean(PrefKeys.COLLECT_LOCATION_INFO, enable);
  }
}

const enum PrefKeys {
  COLLECT_DEVICE_INFO = 'COLLECT_DEVICE_INFO',
  COLLECT_LOCATION_INFO = 'COLLECT_LOCATION_INFO',
}
