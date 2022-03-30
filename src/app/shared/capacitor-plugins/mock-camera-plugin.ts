/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
import {
  CameraPlugin,
  CameraPluginPermissions,
  GalleryImageOptions,
  GalleryPhotos,
  ImageOptions,
  PermissionStatus,
  Photo as CameraPhoto,
} from '@capacitor/camera';
import { PluginListenerHandle } from '@capacitor/core';

export class MockCameraPlugin implements CameraPlugin {
  async pickImages(_: GalleryImageOptions): Promise<GalleryPhotos> {
    throw new Error('Method not implemented.');
  }
  async checkPermissions(): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }
  async requestPermissions(
    _?: CameraPluginPermissions
  ): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }
  async getPhoto(_options: ImageOptions): Promise<CameraPhoto> {
    throw new Error('Method not implemented.');
  }

  addListener(
    _eventName: string,
    _listenerFunc: () => any
  ): PluginListenerHandle {
    throw new Error('Method not implemented.');
  }
}
