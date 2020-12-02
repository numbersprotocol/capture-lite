import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { PreferenceManager } from '../../../preference-manager/preference-manager.service';
import {
  Assets,
  DefaultFactId,
  Facts,
} from '../../../repositories/proof/proof';
import { FactsProvider } from '../facts-provider';

const { Device, Geolocation } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class CapacitorFactsProvider implements FactsProvider {
  readonly id = CapacitorFactsProvider.name;
  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  constructor(private readonly preferenceManager: PreferenceManager) {}

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
    const isLocationInfoCollectionEnabled = await this.isLocationInfoCollectionEnabled();
    if (!isLocationInfoCollectionEnabled) {
      return;
    }
    return Geolocation.getCurrentPosition({
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

  isLocationInfoCollectionEnabled$() {
    return this.preferences.getBoolean$(PrefKeys.COLLECT_LOCATION_INFO, true);
  }

  async isLocationInfoCollectionEnabled() {
    return this.preferences.getBoolean(PrefKeys.COLLECT_LOCATION_INFO, true);
  }

  async setLocationInfoCollection(enable: boolean) {
    return this.preferences.setBoolean(PrefKeys.COLLECT_LOCATION_INFO, enable);
  }
}

const enum PrefKeys {
  COLLECT_DEVICE_INFO = 'COLLECT_DEVICE_INFO',
  COLLECT_LOCATION_INFO = 'COLLECT_LOCATION_INFO',
}
