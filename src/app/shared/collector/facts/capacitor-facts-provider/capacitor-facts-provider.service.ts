import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { TranslocoService } from '@ngneat/transloco';
import { ErrorService } from '../../../error/error.service';
import { BaseError } from '../../../error/errors';
import {
  GeolocationPermissionDeniedError,
  GeolocationService,
  GeolocationTimeoutError,
  GeolocationUnknownError,
} from '../../../geolocation/geolocation.service';
import { PreferenceManager } from '../../../preference-manager/preference-manager.service';
import {
  Assets,
  DefaultFactId,
  Facts,
} from '../../../repositories/proof/proof';
import { FactsProvider } from '../facts-provider';

@Injectable({
  providedIn: 'root',
})
export class CapacitorFactsProvider implements FactsProvider {
  readonly id = 'CapacitorFactsProvider';

  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  readonly isDeviceInfoCollectionEnabled$ = this.preferences.getBoolean$(
    PrefKeys.COLLECT_DEVICE_INFO,
    true
  );

  readonly isGeolocationInfoCollectionEnabled$ = this.preferences.getBoolean$(
    PrefKeys.COLLECT_LOCATION_INFO,
    true
  );

  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly preferenceManager: PreferenceManager,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService
  ) {}

  async provide(
    _: Assets,
    capturedTimestamp: number = Date.now()
  ): Promise<Facts> {
    const deviceInfo = await this.collectDeviceInfo();
    const locationInfo = await this.collectLocationInfo(capturedTimestamp);
    return {
      [DefaultFactId.DEVICE_NAME]: deviceInfo?.model,
      [DefaultFactId.GEOLOCATION_LATITUDE]: locationInfo?.coords.latitude,
      [DefaultFactId.GEOLOCATION_LONGITUDE]: locationInfo?.coords.longitude,
      USER_DEVICE_NAME: deviceInfo?.name,
      PLATFORM: deviceInfo?.platform,
      UUID: deviceInfo?.uuid,
      APP_VERSION: deviceInfo?.appVersion,
      APP_BUILD: deviceInfo?.appBuild,
      APP_ID: deviceInfo?.appId,
      APP_NAME: deviceInfo?.appName,
      OPERATING_SYSTEM: deviceInfo?.operatingSystem,
      OS_VERSION: deviceInfo?.osVersion,
      MANUFACTURER: deviceInfo?.manufacturer,
      IS_VIRTUAL: deviceInfo?.isVirtual,
      MEM_USED: deviceInfo?.memUsed,
      DISK_FREE: deviceInfo?.diskFree,
      DISK_TOTAL: deviceInfo?.diskTotal,
      BATTERY_LEVEL: deviceInfo?.batteryLevel,
      IS_CHARGING: deviceInfo?.isCharging,
    };
  }

  private async collectDeviceInfo() {
    const isDeviceInfoCollectionEnabled =
      await this.isDeviceInfoCollectionEnabled();
    if (!isDeviceInfoCollectionEnabled) {
      return;
    }
    const appInfo = await App.getInfo();
    return {
      appVersion: appInfo.version,
      appBuild: appInfo.build,
      appId: appInfo.id,
      appName: appInfo.name,
      uuid: (await Device.getId()).uuid,
      ...(await Device.getInfo()),
      ...(await Device.getBatteryInfo()),
    };
  }

  private async collectLocationInfo(capturedTimestamp: number) {
    const defaultGeolocationAge = 30000;
    const defaultGeolocationTimeout = 20000;
    const isLocationInfoCollectionEnabled =
      await this.isGeolocationInfoCollectionEnabled();
    if (!isLocationInfoCollectionEnabled) {
      return undefined;
    }

    return this.geolocationService
      .getCurrentPosition({
        capturedTimestamp,
        enableHighAccuracy: true,
        maximumAge: defaultGeolocationAge,
        timeout: defaultGeolocationTimeout,
      })
      .catch((err: unknown) => {
        if (err instanceof BaseError) throw err;
        /*
         * WORKAROUND: iOS/Android location error code is always undefined the
         * only way to determine the error type on Native platform with the
         * Capacitor Geolocation plugin is by parsing the message.
         * But message is not reliable, and iOS doesn't return a expressive
         * error message, so a fallback message is provided.
         */
        if (
          err instanceof Error &&
          (err.message.toLowerCase().includes('permission') ||
            err.message.toLowerCase().includes('denied'))
        )
          throw new GeolocationPermissionDeniedError();
        throw new GeolocationUnknownError();
      })
      .catch((err: unknown) => {
        if (err instanceof GeolocationPermissionDeniedError)
          this.errorService
            .toastError$(
              this.translocoService.translate(
                'error.geolocation.permissionDeniedError'
              )
            )
            .toPromise();
        if (err instanceof GeolocationTimeoutError)
          this.errorService
            .toastError$(
              this.translocoService.translate('error.geolocation.timeoutError')
            )
            .toPromise();
        if (err instanceof GeolocationUnknownError)
          this.errorService
            .toastError$(
              this.translocoService.translate('error.geolocation.unknownError')
            )
            .toPromise();
        return undefined;
      });
  }

  async isDeviceInfoCollectionEnabled() {
    return this.preferences.getBoolean(PrefKeys.COLLECT_DEVICE_INFO, true);
  }

  async setDeviceInfoCollection(enable: boolean) {
    return this.preferences.setBoolean(PrefKeys.COLLECT_DEVICE_INFO, enable);
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
