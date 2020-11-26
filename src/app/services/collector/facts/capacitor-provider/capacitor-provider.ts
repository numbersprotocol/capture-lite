import { Plugins } from '@capacitor/core';
import { defer, of, zip } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import {
  Assets,
  DefaultFactId,
  Facts,
} from '../../../../services/repositories/proof/proof';
import { PreferenceManager } from '../../../../utils/preferences/preference-manager';
import { FactsProvider } from '../facts-provider';

const { Device, Geolocation } = Plugins;
const preferences = PreferenceManager.CAPACITOR_PROVIDER_PREF;
const enum PrefKeys {
  CollectDeviceInfo = 'collectDeviceInfo',
  CollectLocationInfo = 'collectLocationInfo',
}

export class CapacitorProvider implements FactsProvider {
  readonly id = name;

  // TODO: Avoid using static methods `isDeviceInfoCollectionEnabled$` and
  //       `isLocationInfoCollectionEnabled$` after refactor preference utils.
  // tslint:disable-next-line: prefer-function-over-method
  async provide(_: Assets) {
    const defaultGeolocationAge = 600000;
    const defaultGeolocationTimeout = 10000;
    return zip(
      CapacitorProvider.isDeviceInfoCollectionEnabled$(),
      CapacitorProvider.isLocationInfoCollectionEnabled$()
    )
      .pipe(
        first(),
        switchMap(
          ([isDeviceInfoCollectionEnabled, isLocationInfoCollectionEnabled]) =>
            zip(
              isDeviceInfoCollectionEnabled
                ? defer(() => Device.getInfo())
                : of(undefined),
              isLocationInfoCollectionEnabled
                ? defer(() =>
                    Geolocation.getCurrentPosition({
                      enableHighAccuracy: true,
                      maximumAge: defaultGeolocationAge,
                      timeout: defaultGeolocationTimeout,
                    })
                  )
                : of(undefined)
            )
        ),
        map(
          ([deviceInfo, geolocationPosition]): Facts => ({
            [DefaultFactId.DEVICE_NAME]: deviceInfo?.model,
            [DefaultFactId.GEOLOCATION_LATITUDE]:
              geolocationPosition?.coords.latitude,
            [DefaultFactId.GEOLOCATION_LONGITUDE]:
              geolocationPosition?.coords.longitude,
            UUID: deviceInfo?.uuid,
            PLATFORM: deviceInfo?.platform,
            OPERATING_SYSTEM: deviceInfo?.operatingSystem,
            OS_VERSION: deviceInfo?.osVersion,
          })
        )
      )
      .toPromise();
  }

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
}
