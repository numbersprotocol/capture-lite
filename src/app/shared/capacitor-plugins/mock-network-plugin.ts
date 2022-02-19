/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
import { PluginListenerHandle } from '@capacitor/core';
import {
  ConnectionStatus as NetworkStatus,
  ConnectionStatusChangeListener,
  NetworkPlugin,
} from '@capacitor/network';

export class MockNetworkPlugin implements NetworkPlugin {
  async getStatus(): Promise<NetworkStatus> {
    return { connected: false, connectionType: 'unknown' };
  }

  addListener(
    _eventName: 'networkStatusChange',
    _listenerFunc: ConnectionStatusChangeListener
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
    throw new Error('Method not implemented.');
  }

  async removeAllListeners(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
