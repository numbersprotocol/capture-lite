import { Inject, Injectable } from '@angular/core';
import { GeolocationPlugin } from '@capacitor/core';
import { GEOLOCATION_PLUGIN } from '../../core/capacitor-plugins/capacitor-plugins.module';
import { BaseError } from '../../modules/error/errors';

// As most of the geolocation plugins are buggy due to the rapid-updating nature
// of the related APIs in native platforms, wrap the plugin as an adapter.
@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  // Cache the current position manually due to the issue of Capacitor
  // geolocation plugin: https://github.com/ionic-team/capacitor/issues/3304
  private currentPositionCache?: Position;
  private lastCaptureTimestamp?: number;

  constructor(
    @Inject(GEOLOCATION_PLUGIN)
    private readonly geolocationPlugin: GeolocationPlugin
  ) {}

  async getCurrentPosition(
    {
      capturedTimestamp,
      enableHighAccuracy,
      timeout,
      maximumAge,
    }: GetCurrentPositionOptions = {
      enableHighAccuracy: true,
      timeout: undefined,
      maximumAge: undefined,
    }
  ): Promise<Position | undefined> {
    const result = await this._getCurrentPosition({
      capturedTimestamp,
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
    this.lastCaptureTimestamp = capturedTimestamp;
    return result;
  }

  private async _getCurrentPosition(
    {
      capturedTimestamp,
      enableHighAccuracy,
      timeout,
      maximumAge,
    }: GetCurrentPositionOptions = {
      enableHighAccuracy: true,
      timeout: undefined,
      maximumAge: undefined,
    }
  ): Promise<Position | undefined> {
    if (
      capturedTimestamp &&
      maximumAge &&
      maximumAge > 0 &&
      this.currentPositionCache &&
      capturedTimestamp - this.currentPositionCache.timestamp < maximumAge
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
      capturedTimestamp &&
      this.lastCaptureTimestamp &&
      maximumAge &&
      capturedTimestamp - this.lastCaptureTimestamp < maximumAge
    ) {
      return this.currentPositionCache;
    }

    return undefined;
  }
}

async function getTimer(timeout: number) {
  return new Promise<undefined>((_, reject) =>
    setTimeout(() => reject(new LocationUnknownError()), timeout)
  );
}

export interface GetCurrentPositionOptions {
  readonly capturedTimestamp?: number;
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

export class LocationPermissionDeniedError extends BaseError {
  readonly name = 'LocationPermissionDeniedError';
}

export class LocationUnknownError extends BaseError {
  readonly name = 'LocationUnknownError';
}
