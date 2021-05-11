/* eslint-disable class-methods-use-this, @typescript-eslint/require-await  */
import {
  AppLaunchUrl,
  AppPlugin,
  AppState,
  PluginListenerHandle,
} from '@capacitor/core';

export class MockAppPlugin implements AppPlugin {
  addListener(): PluginListenerHandle {
    return { remove: () => undefined };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeAllListeners(): void {}

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
