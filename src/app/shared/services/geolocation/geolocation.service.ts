import { Inject, Injectable } from '@angular/core';
import { GeolocationPlugin } from '@capacitor/core';
import { GEOLOCATION_PLUGIN } from '../../core/capacitor-plugins/capacitor-plugins.module';

// As most of the geolocation plugins are buggy due to the rapid-updating nature
// of the related APIs in native platforms, wrap the plugin as an adapter.
@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  // Cache the current position manually due to the issue of Capacitor
  // geolocation plugin: https://github.com/ionic-team/capacitor/issues/3304
  private currentPositionCache?: Position;
  private lastRequestTimestamp?: number;

  constructor(
    @Inject(GEOLOCATION_PLUGIN)
    private readonly geolocationPlugin: GeolocationPlugin
  ) {}

  async getCurrentPosition(
    { enableHighAccuracy, timeout, maximumAge }: GetCurrentPositionOptions = {
      enableHighAccuracy: true,
      timeout: undefined,
      maximumAge: undefined,
    }
  ): Promise<Position | undefined> {
    const result = await this._getCurrentPosition({
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
    this.lastRequestTimestamp = Date.now();
    return result;
  }

  private async _getCurrentPosition(
    { enableHighAccuracy, timeout, maximumAge }: GetCurrentPositionOptions = {
      enableHighAccuracy: true,
      timeout: undefined,
      maximumAge: undefined,
    }
  ): Promise<Position | undefined> {
    if (
      maximumAge &&
      maximumAge > 0 &&
      this.currentPositionCache &&
      Date.now() - this.currentPositionCache.timestamp < maximumAge
    ) {
      return this.currentPositionCache;
    }

    const result =
      timeout && timeout > 0
        ? await Promise.race([
            this.geolocationPlugin.getCurrentPosition({
              enableHighAccuracy,
              timeout,
              maximumAge,
            }),
            // Set timeout manually to avoid location never resolved:
            // https://github.com/ionic-team/capacitor/issues/3062
            getTimer(timeout),
          ])
        : await this.geolocationPlugin.getCurrentPosition({
            enableHighAccuracy,
            timeout,
            maximumAge,
          });

    if (result) {
      this.currentPositionCache = result;
      return result;
    }

    if (
      this.lastRequestTimestamp &&
      maximumAge &&
      Date.now() - this.lastRequestTimestamp < maximumAge
    ) {
      return this.currentPositionCache;
    }

    return undefined;
  }
}

async function getTimer(timeout: number) {
  return new Promise<undefined>((_, reject) => {
    setTimeout(() => {
      reject(new GeolocationError(GeolocationErrorCode.TIMEOUT));
    }, timeout);
  });
}

export interface GetCurrentPositionOptions {
  readonly enableHighAccuracy?: boolean;
  readonly timeout?: number;
  readonly maximumAge?: number;
}

export interface Position {
  readonly timestamp: number;
  readonly coords: Coordinates;
}

interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export class GeolocationError {
  constructor(readonly code: GeolocationErrorCode, readonly message?: string) {}
}

export const enum GeolocationErrorCode {
  NOT_USED,
  PERMISSION_DENIED,
  POSITION_UNAVAILABLE,
  TIMEOUT,
}
