import { Inject, Injectable } from '@angular/core';
import { GeolocationPlugin, Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
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
    private readonly preferenceManager: PreferenceManager,
    private readonly translocoService: TranslocoService
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
      return undefined;
    }
    return this.geolocationPlugin
      .getCurrentPosition({
        enableHighAccuracy: true,
        maximumAge: defaultGeolocationAge,
        timeout: defaultGeolocationTimeout,
      })
      .catch((err: GeolocationPositionError) => {
        this.throwGeolocationPostiionErrorWithMessage(err);
        return undefined;
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

  private throwGeolocationPostiionErrorWithMessage(
    error: GeolocationPositionError
  ) {
    let message = '';
    switch (error.code) {
      case GeolocationPositionErrorCode.PERMISSION_DENIED:
        message = this.translocoService.translate(
          'error.locationPermissionDenied'
        );
        break;
      case GeolocationPositionErrorCode.POSITION_UNAVAILABLE:
        message = this.translocoService.translate(
          'error.locationPositionUnavailable'
        );
        break;
      case GeolocationPositionErrorCode.TIMEOUT:
        message = this.translocoService.translate('error.locationTimeout');
        break;
      default:
        /*
         * WORKAROUND: iOS/Android location error code is always undefined
         * the only way to determine the error type on Native platform with the Capacitor Geolocation plugin
         * is by parsing the message.
         * But message is not reliable, and iOS doesn't return a expressive error message,
         * so a fallback message is provided.
         */
        if (
          error.message.toLowerCase().includes('permission') ||
          error.message.toLowerCase().includes('denied')
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
    throw new Error(message);
  }
}

const enum PrefKeys {
  COLLECT_DEVICE_INFO = 'COLLECT_DEVICE_INFO',
  COLLECT_LOCATION_INFO = 'COLLECT_LOCATION_INFO',
}

const enum GeolocationPositionErrorCode {
  NOT_USED,
  PERMISSION_DENIED,
  POSITION_UNAVAILABLE,
  TIMEOUT,
}
export interface GeolocationPositionError {
  code: GeolocationPositionErrorCode;
  message: string;
}
