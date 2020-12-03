import { Inject, Injectable } from '@angular/core';
import { FilesystemDirectory, FilesystemPlugin } from '@capacitor/core';
import { Mutex } from 'async-mutex';
import { FILESYSTEM_PLUGIN } from '../../shared/capacitor-plugins/capacitor-plugins.module';
import { sha256WithBase64 } from '../../utils/crypto/crypto';

@Injectable({
  providedIn: 'root',
})
export class FileStore {
  private readonly directory = FilesystemDirectory.Data;
  private readonly rootDir = FileStore.name;
  private readonly mutex = new Mutex();
  private hasInitialized = false;

  constructor(
    @Inject(FILESYSTEM_PLUGIN)
    private readonly filesystemPlugin: FilesystemPlugin
  ) {}

  private async initialize() {
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
  }

  async read(hash: string) {
    await this.initialize();
    const result = await this.filesystemPlugin.readFile({
      directory: this.directory,
      path: `${this.rootDir}/${hash}`,
    });
    return result.data;
  }

  async write(base64: string) {
    const hash = await sha256WithBase64(base64);
    await this.initialize();
    return this.withLock(async () => {
      await this.filesystemPlugin.writeFile({
        directory: this.directory,
        path: `${this.rootDir}/${hash}`,
        data: base64,
        recursive: true,
      });
      return hash;
    });
  }

  async delete(hash: string) {
    await this.initialize();
    return this.withLock(async () => {
      await this.filesystemPlugin.deleteFile({
        directory: this.directory,
        path: `${this.rootDir}/${hash}`,
      });
    });
  }

  async exists(hash: string) {
    await this.initialize();
    const result = await this.filesystemPlugin.readdir({
      directory: this.directory,
      path: `${this.rootDir}`,
    });
    return result.files.includes(hash);
  }

  async clear() {
    await this.initialize();
    return this.withLock(async () => {
      await this.filesystemPlugin.rmdir({
        directory: this.directory,
        path: this.rootDir,
        recursive: true,
      });
      this.hasInitialized = false;
    });
  }

  private async withLock<K>(action: () => Promise<K>) {
    const release = await this.mutex.acquire();
    try {
      // Await for the action to finish before releasing the lock.
      return await action();
    } finally {
      release();
    }
  }
}
