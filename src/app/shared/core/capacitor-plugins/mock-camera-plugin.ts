// tslint:disable: prefer-function-over-method no-async-without-await
import {
  CameraOptions,
  CameraPhoto,
  CameraPlugin,
  PluginListenerHandle,
} from '@capacitor/core';

export class MockCameraPlugin implements CameraPlugin {
  async getPhoto(_options: CameraOptions): Promise<CameraPhoto> {
    throw new Error('Method not implemented.');
  }

  addListener(
    _eventName: string,
    _listenerFunc: () => any
  ): PluginListenerHandle {
    throw new Error('Method not implemented.');
  }
}
