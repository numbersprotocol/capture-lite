/* eslint-disable class-methods-use-this, @typescript-eslint/require-await  */
import {
  AppInfo,
  AppLaunchUrl,
  AppPlugin,
  AppState,
  BackButtonListener,
  RestoredListener,
  StateChangeListener,
  URLOpenListener,
} from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';

export class MockAppPlugin implements AppPlugin {
  async getInfo(): Promise<AppInfo> {
    throw new Error('Method not implemented.');
  }

  async minimizeApp(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  addListener(
    eventName: 'appStateChange',
    listenerFunc: StateChangeListener
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    eventName: 'appUrlOpen',
    listenerFunc: URLOpenListener
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    eventName: 'appRestoredResult',
    listenerFunc: RestoredListener
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    eventName: 'backButton',
    listenerFunc: BackButtonListener
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  addListener(
    _eventName: any,
    _listenerFunc: any
  ): Promise<PluginListenerHandle> & PluginListenerHandle {
    throw new Error('Method not implemented.');
  }

  async removeAllListeners(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  exitApp(): never {
    throw new Error('exited');
  }

  async canOpenUrl(_: { url: string }): Promise<{ value: boolean }> {
    return Promise.resolve({ value: true });
  }

  async getLaunchUrl(): Promise<AppLaunchUrl> {
    return Promise.resolve({ url: '' });
  }

  async getState(_options?: any): Promise<AppState> {
    return { isActive: true };
  }

  async openUrl(_: { url: string }): Promise<{ completed: boolean }> {
    return Promise.resolve({ completed: true });
  }
}
