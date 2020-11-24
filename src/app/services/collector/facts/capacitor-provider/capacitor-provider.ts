import { Plugins } from '@capacitor/core';
import { defer, of, zip } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { Assets, DefaultFactId, Facts } from 'src/app/services/repositories/proof/proof';
import { PreferenceManager } from 'src/app/utils/preferences/preference-manager';
import { FactsProvider } from '../facts-provider';

const { Device, Geolocation } = Plugins;
const preferences = PreferenceManager.CAPACITOR_PROVIDER_PREF;
const enum PrefKeys {
  CollectDeviceInfo = 'collectDeviceInfo',
  CollectLocationInfo = 'collectLocationInfo'
}

export class CapacitorProvider implements FactsProvider {
  readonly id = name;

  static isDeviceInfoCollectionEnabled$() {
    return preferences.getBoolean$(PrefKeys.CollectDeviceInfo, true);
  }

  static setDeviceInfoCollection$(enable: boolean) {
    return preferences.setBoolean$(PrefKeys.CollectDeviceInfo, enable);
  }

  static isLocationInfoCollectionEnabled$() {
    return preferences.getBoolean$(PrefKeys.CollectLocationInfo, true);
  }

  static setLocationInfoCollection$(enable: boolean) {
    return preferences.setBoolean$(PrefKeys.CollectLocationInfo, enable);
  }

  async provide(_: Assets) {
    return zip(
      CapacitorProvider.isDeviceInfoCollectionEnabled$(),
      CapacitorProvider.isLocationInfoCollectionEnabled$()
    ).pipe(
      first(),
      switchMap(([isDeviceInfoCollectionEnabled, isLocationInfoCollectionEnabled]) => zip(
        isDeviceInfoCollectionEnabled ? defer(() => Device.getInfo()) : of(undefined),
        isLocationInfoCollectionEnabled ? defer(() => Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          maximumAge: 10 * 60 * 1000,
          timeout: 10 * 1000
        })) : of(undefined))),
      map(([deviceInfo, geolocationPosition]) => ({
        [DefaultFactId.DEVICE_NAME]: deviceInfo?.name,
        [DefaultFactId.GEOLOCATION_LATITUDE]: geolocationPosition?.coords.latitude,
        [DefaultFactId.GEOLOCATION_LONGITUDE]: geolocationPosition?.coords.longitude
      } as Facts))
    ).toPromise();
  }
}
