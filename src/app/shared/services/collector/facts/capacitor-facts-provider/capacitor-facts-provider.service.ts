import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import {
  GeolocationError,
  GeolocationErrorCode,
  GeolocationService,
} from '../../../geolocation/geolocation.service';
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
    private readonly snackBar: MatSnackBar,
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
      BETTERY_LEVEL: deviceInfo?.batteryLevel,
      IS_CHARGING: deviceInfo?.isCharging,
    };
  }

  private async collectDeviceInfo() {
    const isDeviceInfoCollectionEnabled = await this.isDeviceInfoCollectionEnabled();
    if (!isDeviceInfoCollectionEnabled) {
      return;
    }
    return { ...(await Device.getInfo()), ...(await Device.getBatteryInfo()) };
  }

  private async collectLocationInfo(capturedTimestamp: number) {
    const defaultGeolocationAge = 30000;
    const defaultGeolocationTimeout = 20000;
    const isLocationInfoCollectionEnabled = await this.isGeolocationInfoCollectionEnabled();
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
      .catch((error: any) => {
        if (error instanceof GeolocationError) {
          this.showGeolocationPostiionErrorMessage(error);
        }
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

  private showGeolocationPostiionErrorMessage(error: GeolocationError) {
    let message = '';
    switch (error.code) {
      case GeolocationErrorCode.PERMISSION_DENIED:
        message = this.translocoService.translate(
          'error.locationPermissionDenied'
        );
        break;
      case GeolocationErrorCode.POSITION_UNAVAILABLE:
        message = this.translocoService.translate(
          'error.locationPositionUnavailable'
        );
        break;
      case GeolocationErrorCode.TIMEOUT:
        message = this.translocoService.translate('error.locationTimeout');
        break;
      default:
        /*
         * WORKAROUND: iOS/Android location error code is always undefined the
         * only way to determine the error type on Native platform with the
         * Capacitor Geolocation plugin is by parsing the message.
         * But message is not reliable, and iOS doesn't return a expressive
         * error message, so a fallback message is provided.
         */
        if (
          error.message?.toLowerCase().includes('permission') ||
          error.message?.toLowerCase().includes('denied')
        ) {
          message = this.translocoService.translate(
            'error.locationPermissionDenied'
          );
        } else {
          message = this.translocoService.translate(
            'error.locationUnknownError'
          );
        }
        break;
    }
    this.snackBar.open(message, this.translocoService.translate('dismiss'), {
      duration: 4000,
    });
  }
}

const enum PrefKeys {
  COLLECT_DEVICE_INFO = 'COLLECT_DEVICE_INFO',
  COLLECT_LOCATION_INFO = 'COLLECT_LOCATION_INFO',
}
