/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
import { PluginListenerHandle } from '@capacitor/core';
import {
  ConnectionStatusChangeListener,
  NetworkPlugin,
  ConnectionStatus as NetworkStatus,
} from '@capacitor/network';

export class MockNetworkPlugin implements NetworkPlugin {
  async getStatus(): Promise<NetworkStatus> {
    return { connected: false, connectionType: 'unknown' };
  }

  async addListener(
    _eventName: 'networkStatusChange',
    _listenerFunc: ConnectionStatusChangeListener
  ): Promise<PluginListenerHandle> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const remove = async () => {};
    const listenerHandler: any = Promise.resolve({ remove });
    Object.defineProperty(listenerHandler, 'remove', {
      value: async () => Promise.resolve({ remove }),
    });
    return listenerHandler;
  }

  async removeAllListeners(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
