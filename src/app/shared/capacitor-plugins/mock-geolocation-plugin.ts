/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
import { PluginListenerHandle } from '@capacitor/core';
import {
  GeolocationPlugin,
  GeolocationPluginPermissions,
  PermissionStatus,
  Position as GeolocationPosition,
  PositionOptions as GeolocationOptions,
  WatchPositionCallback,
} from '@capacitor/geolocation';

export class MockGeolocationPlugin implements GeolocationPlugin {
  async checkPermissions(): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }

  async requestPermissions(
    _permissions?: GeolocationPluginPermissions
  ): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }

  async getCurrentPosition(
    _options?: GeolocationOptions
  ): Promise<GeolocationPosition> {
    return {
      timestamp: Date.now(),
      coords: {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        altitudeAccuracy: 0,
        altitude: 0,
        heading: 0,
        speed: 0,
      },
    };
  }

  async watchPosition(
    _options: GeolocationOptions,
    _callback: WatchPositionCallback
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async clearWatch(_options: { id: string }): Promise<void> {
    throw new Error('Method not implemented.');
  }

  addListener(
    _eventName: string,
    _listenerFunc: () => any
  ): PluginListenerHandle {
    throw new Error('Method not implemented.');
  }
}
