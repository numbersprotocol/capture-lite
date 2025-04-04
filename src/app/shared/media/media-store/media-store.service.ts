import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  Directory as FilesystemDirectory,
  FilesystemPlugin,
} from '@capacitor/filesystem';
import { Mutex } from 'async-mutex';
import write_blob from 'capacitor-blob-writer';
import Compressor from 'compressorjs';
import { defer, merge } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { sha256WithBase64 } from '../../../utils/crypto/crypto';
import { base64ToBlob, blobToBase64 } from '../../../utils/encoding/encoding';
import { MimeType, fromExtension, toExtension } from '../../../utils/mime-type';
import { toDataUrl } from '../../../utils/url';
import { FILESYSTEM_PLUGIN } from '../../capacitor-plugins/capacitor-plugins.module';
import { Database } from '../../database/database.service';
import { OnConflictStrategy, Tuple } from '../../database/table/table';

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
  private readonly extensionTable =
    this.database.getTable<ImageExtension>(`ImageStore_extension`);
  private readonly thumbnailTable =
    this.database.getTable<Thumbnail>(`ImageStore_thumbnail`);

  constructor(
    @Inject(FILESYSTEM_PLUGIN)
    private readonly filesystemPlugin: FilesystemPlugin,
    private readonly database: Database,
    private readonly httpClient: HttpClient
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
      if (!dirs.files.find(f => f.name.includes(this.rootDir))) {
        await this.filesystemPlugin.mkdir({
          directory: this.directory,
          path: this.rootDir,
          recursive: true,
        });
      }
      this.hasInitialized = true;
    });
  }

  async read(index: string): Promise<string> {
    await this.initialize();
    const extension = await this.getExtension(index);
    if (!extension) throw new Error(`Cannot get extension of ${index}.`);
    const url = await this.getUrl(index, fromExtension(extension));
    const blob = await this.httpClient
      .get(url, { responseType: 'blob' })
      .toPromise();
    return blobToBase64(blob);
  }

  async readWithFileSystem(index: string) {
    await this.initialize();
    const extension = await this.getExtension(index);
    const result = await this.filesystemPlugin.readFile({
      directory: this.directory,
      path: `${this.rootDir}/${index}.${extension}`,
    });
    return result.data as string;
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
    if (exists) return index;
    return this._write(index, base64, mimeType);
  }

  private async _write(index: string, base64: string, mimeType: MimeType) {
    await this.initialize();
    return this.mutex.runExclusive(async () => {
      const mediaExtension = await this.setMediaExtension(index, mimeType);
      if (Capacitor.isNativePlatform()) {
        const blob = await base64ToBlob(base64, mimeType);
        await write_blob({
          directory: this.directory,
          path: `${this.rootDir}/${index}.${mediaExtension.extension}`,
          blob: blob,
          recursive: true,
        });
      } else {
        await this.filesystemPlugin.writeFile({
          directory: this.directory,
          path: `${this.rootDir}/${index}.${mediaExtension.extension}`,
          data: base64,
          recursive: true,
        });
      }
      return index;
    });
  }

  async delete(index: string) {
    await this.initialize();
    await this.deleteThumbnail(index);
    return this.mutex.runExclusive(async () => {
      const extension = await this.getExtension(index);
      try {
        await this.filesystemPlugin.deleteFile({
          directory: this.directory,
          path: `${this.rootDir}/${index}.${extension}`,
        });
      } catch (error: any) {
        /* WORKAROUND
         * In capture app we get "File does not exist error"
         * if currentPlatform.isAndroid() === true &&
         *    fileToBeDeleted.isCapturedFromIphone() === true
         * When we delete capture from iPhone that was captured
         * by Android "File does not exists" is not thrown.
         * So we can silently ignore "File does not exist" error
         * while deleting capture from FileSystem only.
         */
        if (error.message !== 'File does not exist') {
          throw error;
        }
      }
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
    return (
      result.files.find(f => f.name.includes(`${index}.${extension}`)) !==
      undefined
    );
  }

  getThumbnailUrl$(index: string, mimeType: MimeType) {
    const isVideo = mimeType.startsWith('video');
    const thumbnailMimeType = isVideo ? 'image/jpeg' : mimeType;
    const createThumbnail$ = defer(() =>
      this.setThumbnail(index, mimeType)
    ).pipe(map(base64 => toDataUrl(base64, thumbnailMimeType)));
    return defer(() => this.getThumbnail(index)).pipe(
      concatMap(thumbnail => {
        if (thumbnail) {
          return defer(() =>
            this.getUrl(thumbnail.thumbnailIndex, thumbnailMimeType)
          );
        }
        if (isVideo) {
          return createThumbnail$;
        }
        return merge(
          defer(() => this.getUrl(index, thumbnailMimeType)),
          createThumbnail$
        );
      })
    );
  }

  private async setThumbnail(index: string, mimeType: MimeType) {
    const thumbnailBase64 = await this.makeThumbnail(index, mimeType);
    const isVideo = mimeType.startsWith('video');
    const thumbnailMimeType = isVideo ? 'image/jpeg' : mimeType;
    return this.storeThumbnail(index, thumbnailBase64, thumbnailMimeType);
  }

  private async makeThumbnail(index: string, mimeType: MimeType) {
    const thumbnailSize = 500;
    const thumbnailBlob = mimeType.startsWith('video')
      ? await makeVideoThumbnail({
          videoUrl: await this.getUrl(index, mimeType),
          width: thumbnailSize,
        })
      : await makeImageThumbnail({
          image: await base64ToBlob(await this.read(index), mimeType),
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

  async getThumbnail(index: string) {
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
    if (Capacitor.isNativePlatform()) {
      // Workaround to fix urls (thumbnails) saved as incorrect mimeType.
      await this.fixIncorrectExtension(index, mimeType);
      return Capacitor.convertFileSrc(await this.getUri(index));
    }
    return URL.createObjectURL(
      await base64ToBlob(await this.readWithFileSystem(index), mimeType)
    );
  }

  private async fixIncorrectExtension(
    index: string,
    expectedMimeType: MimeType
  ) {
    const extension = await this.getExtension(index);
    if (extension) {
      if (fromExtension(extension) !== expectedMimeType) {
        const base64 = await this.read(index);
        await this._write(index, base64, expectedMimeType);
      }
    }
    return index;
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
        OnConflictStrategy.REPLACE
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
  quality = 0.8,
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
  videoUrl,
  width,
  quality = 0.6,
}: {
  videoUrl: string;
  width: number;
  quality?: number;
}) {
  return new Promise<Blob>((resolve, reject) => {
    const videoElement = document.createElement('video');
    videoElement.addEventListener('canplay', onCanPlay);
    function onCanPlay() {
      videoElement.removeEventListener('canplay', onCanPlay);
      videoElement.addEventListener('seeked', onSeeked);
      const oneSecond = 1;
      videoElement.currentTime = Math.min(videoElement.duration || oneSecond);
    }
    function onSeeked() {
      videoElement.removeEventListener('seeked', onSeeked);
      const canvas = document.createElement('canvas');
      const { videoWidth, videoHeight } = videoElement;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const context = canvas.getContext('2d');
      if (!context) reject(TypeError('2d context is undefined.'));
      else {
        context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
        canvas.toBlob(
          image => {
            if (image) resolve(makeImageThumbnail({ image, width, quality }));
            else reject(TypeError('canvas.toBlob is null.'));
          },
          'image/jpeg',
          quality
        );
      }
    }
    videoElement.addEventListener('error', reject);
    videoElement.preload = 'auto';
    videoElement.src = videoUrl;
    videoElement.load();
  });
}
