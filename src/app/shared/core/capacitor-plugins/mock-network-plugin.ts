// tslint:disable: prefer-function-over-method no-async-without-await
import {
  NetworkPlugin,
  NetworkStatus,
  PluginListenerHandle,
} from '@capacitor/core';

export class MockNetworkPlugin implements NetworkPlugin {
  async getStatus(): Promise<NetworkStatus> {
    return { connected: false, connectionType: 'unknown' };
  }

  addListener(
    _eventName: string,
    _listenerFunc: (status: NetworkStatus) => any
  ): PluginListenerHandle {
    throw new Error('Method not implemented.');
  }

  removeAllListeners() {
    throw new Error('Method not implemented.');
  }
}
