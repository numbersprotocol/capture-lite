import { Inject, Injectable } from '@angular/core';
import {
  Capacitor,
  FilesystemDirectory,
  FilesystemPlugin,
} from '@capacitor/core';
import { Mutex } from 'async-mutex';
import Compressor from 'compressorjs';
import { defer, merge } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { sha256WithBase64 } from '../../../utils/crypto/crypto';
import { base64ToBlob, blobToBase64 } from '../../../utils/encoding/encoding';
import { MimeType, toExtension } from '../../../utils/mime-type';
import { toDataUrl } from '../../../utils/url';
import { FILESYSTEM_PLUGIN } from '../../core/capacitor-plugins/capacitor-plugins.module';
import { Database } from '../database/database.service';
import { OnConflictStrategy, Tuple } from '../database/table/table';

// TODO: Implement a CacheStore service to cache the thumb and other files, such
//       as the image thumb from backend. User should be able to clear the cache
//       freely. Finally, extract ImageStore.thumbnailTable to CacheStore.

@Injectable({
  providedIn: 'root',
})
export class MediaStore {
  private readonly directory = FilesystemDirectory.Data;
  private readonly rootDir = 'ImageStore';
  private readonly mutex = new Mutex();
  private hasInitialized = false;
  private readonly extensionTable = this.database.getTable<ImageExtension>(
    `ImageStore_extension`
  );
  private readonly thumbnailTable = this.database.getTable<Thumbnail>(
    `ImageStore_thumbnail`
  );

  constructor(
    @Inject(FILESYSTEM_PLUGIN)
    private readonly filesystemPlugin: FilesystemPlugin,
    private readonly database: Database
  ) {}

  private async initialize() {
    return this.mutex.runExclusive(async () => {
      if (this.hasInitialized) {
        return;
      }
      const dirs = await this.filesystemPlugin.readdir({
        directory: this.directory,
        path: '',
      });
      if (!dirs.files.includes(this.rootDir)) {
        await this.filesystemPlugin.mkdir({
          directory: this.directory,
          path: this.rootDir,
          recursive: true,
        });
      }
      this.hasInitialized = true;
    });
  }

  async read(index: string) {
    await this.initialize();
    const extension = await this.getExtension(index);
    const result = await this.filesystemPlugin.readFile({
      directory: this.directory,
      path: `${this.rootDir}/${index}.${extension}`,
    });
    return result.data;
  }

  async write(
    base64: string,
    mimeType: MimeType,
    onWriteExistStrategy = OnWriteExistStrategy.REPLACE
  ) {
    const index = await sha256WithBase64(base64);
    await this.initialize();
    if (onWriteExistStrategy === OnWriteExistStrategy.REPLACE) {
      return this._write(index, base64, mimeType);
    }
    const exists = await this.exists(index);
    if (exists) {
      return index;
    }
    return this._write(index, base64, mimeType);
  }

  private async _write(index: string, base64: string, mimeType: MimeType) {
    await this.initialize();
    return this.mutex.runExclusive(async () => {
      const mediaExtension = await this.setMediaExtension(index, mimeType);
      await this.filesystemPlugin.writeFile({
        directory: this.directory,
        path: `${this.rootDir}/${index}.${mediaExtension.extension}`,
        data: base64,
        recursive: true,
      });
      return index;
    });
  }

  async delete(index: string) {
    await this.initialize();
    await this.deleteThumbnail(index);
    return this.mutex.runExclusive(async () => {
      const extension = await this.getExtension(index);
      await this.filesystemPlugin.deleteFile({
        directory: this.directory,
        path: `${this.rootDir}/${index}.${extension}`,
      });
      await this.deleteMediaExtension(index);
      return index;
    });
  }

  async exists(index: string) {
    await this.initialize();
    const result = await this.filesystemPlugin.readdir({
      directory: this.directory,
      path: `${this.rootDir}`,
    });
    const extension = await this.getExtension(index);
    return result.files.includes(`${index}.${extension}`);
  }

  getThumbnailUrl$(index: string, mimeType: MimeType) {
    const isVideo = mimeType.startsWith('video');
    const thumbnailMimeType = isVideo ? 'image/jpeg' : mimeType;
    return defer(() => this.getThumbnail(index)).pipe(
      concatMap(thumbnail => {
        if (thumbnail) {
          return defer(() => this.read(thumbnail.thumbnailIndex)).pipe(
            map(base64 => toDataUrl(base64, thumbnailMimeType))
          );
        }
        if (isVideo) {
          return defer(() => this.setThumbnail(index, mimeType)).pipe(
            map(base64 => toDataUrl(base64, thumbnailMimeType))
          );
        }
        return merge(
          defer(() => this.getUrl(index, thumbnailMimeType)),
          defer(() => this.setThumbnail(index, thumbnailMimeType)).pipe(
            map(base64 => toDataUrl(base64, thumbnailMimeType))
          )
        );
      })
    );
  }

  private async setThumbnail(index: string, mimeType: MimeType) {
    const thumbnailBase64 = await this.makeThumbnail(index, mimeType);
    console.log('thumbnailBase64', thumbnailBase64);
    return this.storeThumbnail(index, thumbnailBase64, mimeType);
  }

  private async makeThumbnail(index: string, mimeType: MimeType) {
    const thumbnailSize = 100;
    const blob = await base64ToBlob(await this.read(index), mimeType);
    const thumbnailBlob = mimeType.startsWith('video')
      ? await makeVideoThumbnail({ video: blob, width: thumbnailSize })
      : await makeImageThumbnail({
          image: blob,
          width: thumbnailSize,
        });
    return blobToBase64(thumbnailBlob);
  }

  async storeThumbnail(
    index: string,
    thumbnailBase64: string,
    mimeType: MimeType
  ) {
    await this.thumbnailTable.insert(
      [
        {
          imageIndex: index,
          thumbnailIndex: await this.write(thumbnailBase64, mimeType),
        },
      ],
      OnConflictStrategy.IGNORE
    );
    return thumbnailBase64;
  }

  private async deleteThumbnail(index: string) {
    const thumbnail = await this.getThumbnail(index);

    if (!thumbnail) {
      return index;
    }

    await Promise.all([
      this.delete(thumbnail.thumbnailIndex),
      this.thumbnailTable.delete([thumbnail]),
    ]);
    return index;
  }

  private async getThumbnail(index: string) {
    const thumbnails = await this.thumbnailTable.queryAll();
    return thumbnails.find(thumb => thumb.imageIndex === index);
  }

  async getUri(index: string) {
    await this.initialize();
    const extension = await this.getExtension(index);
    if (!extension)
      throw new Error(`Cannot get extension with index: ${index}`);
    const result = await this.filesystemPlugin.getUri({
      directory: this.directory,
      path: `${this.rootDir}/${index}.${extension}`,
    });
    return result.uri;
  }

  /**
   * Use this method when loading large image. Read data as base64 string
   * directly when dealing with small image for better performance.
   */
  async getUrl(index: string, mimeType: MimeType) {
    if (Capacitor.isNative)
      return Capacitor.convertFileSrc(await this.getUri(index));
    return toDataUrl(await this.read(index), mimeType);
  }

  private async getExtension(index: string) {
    return (await this.getMediaExtension(index))?.extension;
  }

  private async getMediaExtension(index: string) {
    const mediaExtensions = await this.extensionTable.queryAll();
    return mediaExtensions.find(
      mediaExtension => mediaExtension.imageIndex === index
    );
  }

  private async setMediaExtension(index: string, mimeType: MimeType) {
    return (
      await this.extensionTable.insert(
        [{ imageIndex: index, extension: toExtension(mimeType) }],
        OnConflictStrategy.IGNORE
      )
    )[0];
  }

  private async deleteMediaExtension(index: string) {
    const imageExtension = await this.getMediaExtension(index);
    if (!imageExtension) {
      return index;
    }
    await this.extensionTable.delete([imageExtension]);
    return index;
  }

  async clear() {
    await this.initialize();
    await this.extensionTable.clear();
    await this.thumbnailTable.clear();
    return this.mutex.runExclusive(async () => {
      this.hasInitialized = false;
      await this.filesystemPlugin.rmdir({
        directory: this.directory,
        path: this.rootDir,
        recursive: true,
      });
    });
  }

  async drop() {
    await this.clear();
    await this.extensionTable.drop();
    await this.thumbnailTable.drop();
  }
}

interface ImageExtension extends Tuple {
  readonly imageIndex: string;
  readonly extension: string;
}

interface Thumbnail extends Tuple {
  readonly imageIndex: string;
  readonly thumbnailIndex: string;
}

export const enum OnWriteExistStrategy {
  IGNORE,
  REPLACE,
}

async function makeImageThumbnail({
  image,
  width,
  quality = 0.6,
}: {
  image: Blob;
  width: number;
  quality?: number;
}) {
  return new Promise<Blob>((resolve, reject) => {
    new Compressor(image, {
      quality,
      width,
      success(result) {
        resolve(result);
      },
      error(err) {
        reject(err);
      },
    });
  });
}

async function makeVideoThumbnail({
  video,
  width,
  quality = 0.6,
}: {
  video: Blob;
  width: number;
  quality?: number;
}) {
  return new Promise<Blob>((resolve, reject) => {
    const videoElement = document.createElement('video');
    const canvas = document.createElement('canvas');
    videoElement.addEventListener('error', reject);
    canvas.addEventListener('error', reject);
    videoElement.addEventListener('canplay', () => {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) reject(TypeError('2d context is undefined.'));
      else {
        context.drawImage(
          videoElement,
          0,
          0,
          videoElement.videoWidth,
          videoElement.videoHeight
        );
        canvas.toBlob(
          blob => {
            if (blob)
              resolve(makeImageThumbnail({ image: blob, width, quality }));
            else reject(TypeError('canvas.toBlob is null.'));
          },
          video.type,
          quality
        );
      }
    });
    videoElement.preload = 'auto';
    videoElement.src = URL.createObjectURL(video);
    videoElement.load();
  });
}
