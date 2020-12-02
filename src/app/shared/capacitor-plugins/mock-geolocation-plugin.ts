import {
  GeolocationOptions,
  GeolocationPlugin,
  GeolocationPosition,
  GeolocationWatchCallback,
  PluginListenerHandle,
} from '@capacitor/core';

export class MockGeolocationPlugin implements GeolocationPlugin {
  // tslint:disable-next-line: prefer-function-over-method
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

  // tslint:disable-next-line: prefer-function-over-method
  watchPosition(
    _options: GeolocationOptions,
    _callback: GeolocationWatchCallback
  ): string {
    throw new Error('Method not implemented.');
  }

  // tslint:disable-next-line: prefer-function-over-method promise-function-async
  clearWatch(_options: { id: string }): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // tslint:disable-next-line: prefer-function-over-method
  addListener(
    _eventName: string,
    _listenerFunc: () => any
  ): PluginListenerHandle {
    throw new Error('Method not implemented.');
  }
}
