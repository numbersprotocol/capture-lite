/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
import {
  GeolocationOptions,
  GeolocationPlugin,
  GeolocationPosition,
  GeolocationWatchCallback,
  PluginListenerHandle,
} from '@capacitor/core';

export class MockGeolocationPlugin implements GeolocationPlugin {
  async getCurrentPosition(
    _options?: GeolocationOptions
  ): Promise<GeolocationPosition> {
    return {
      timestamp: Date.now(),
      coords: {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
      },
    };
  }

  watchPosition(
    _options: GeolocationOptions,
    _callback: GeolocationWatchCallback
  ): string {
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
