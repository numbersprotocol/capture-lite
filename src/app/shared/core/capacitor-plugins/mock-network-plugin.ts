/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return { remove: () => {} };
  }

  removeAllListeners() {
    throw new Error('Method not implemented.');
  }
}
