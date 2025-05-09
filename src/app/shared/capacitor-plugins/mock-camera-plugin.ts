/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
import {
  Photo as CameraPhoto,
  CameraPlugin,
  CameraPluginPermissions,
  GalleryImageOptions,
  GalleryPhotos,
  ImageOptions,
  PermissionStatus,
} from '@capacitor/camera';

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

  async pickLimitedLibraryPhotos(): Promise<GalleryPhotos> {
    throw new Error('Method not implemented.');
  }

  async getLimitedLibraryPhotos(): Promise<GalleryPhotos> {
    throw new Error('Method not implemented.');
  }
}
