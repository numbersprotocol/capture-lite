/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
import { PluginListenerHandle } from '@capacitor/core';
import {
  CopyOptions,
  CopyResult,
  DownloadFileOptions,
  DownloadFileResult,
  AppendFileOptions as FileAppendOptions,
  DeleteFileOptions as FileDeleteOptions,
  FileInfo,
  ReadFileOptions as FileReadOptions,
  ReadFileResult as FileReadResult,
  WriteFileOptions as FileWriteOptions,
  WriteFileResult as FileWriteResult,
  FilesystemPlugin,
  GetUriOptions,
  GetUriResult,
  MkdirOptions,
  PermissionStatus,
  ProgressListener,
  ReaddirOptions,
  ReaddirResult,
  RenameOptions,
  RmdirOptions,
  StatOptions,
  StatResult,
} from '@capacitor/filesystem';
import { groupBy } from 'lodash-es';
import {
  base64ToString,
  blobToBase64,
  stringToBase64,
} from '../../utils/encoding/encoding';

export class MockFilesystemPlugin implements FilesystemPlugin {
  private readonly files = new Map<string, string>();

  async checkPermissions(): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }

  async requestPermissions(): Promise<PermissionStatus> {
    throw new Error('Method not implemented.');
  }

  async readFile(options: FileReadOptions): Promise<FileReadResult> {
    const path = `${options.directory ?? ''}/${options.path}`;
    if (!this.files.has(path)) {
      throw new Error(`File ${path} does not exist.`);
    }
    const data = this.files.get(path)!;
    if (!options.encoding) {
      // base64
      return { data };
    }
    return { data: base64ToString(data) };
  }

  async writeFile(options: FileWriteOptions): Promise<FileWriteResult> {
    const path = `${options.directory ?? ''}/${options.path}`;
    if (options.data instanceof Blob) {
      this.files.set(path, await blobToBase64(options.data));
    } else if (!options.encoding) {
      this.files.set(path, options.data);
    } else {
      this.files.set(path, stringToBase64(options.data));
    }
    return { uri: path };
  }

  async appendFile(options: FileAppendOptions): Promise<void> {
    const result = await this.readFile(options);
    const newData = `${result.data}${options.data}`;
    await this.writeFile({ ...options, data: newData });
  }

  async deleteFile(options: FileDeleteOptions): Promise<void> {
    const path = `${options.directory ?? ''}/${options.path}`;
    this.files.delete(path);
  }

  async mkdir(_: MkdirOptions): Promise<void> {
    return;
  }

  async rmdir(_: RmdirOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async readdir(options: ReaddirOptions): Promise<ReaddirResult> {
    const directorys = groupBy([...this.files.keys()], path =>
      path.substring(0, path.lastIndexOf('/'))
    );
    const targetDirectory = `${options.directory ?? ''}${options.path}`;
    const directory = directorys[targetDirectory];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!directory) {
      return { files: [] };
    }
    return {
      files: directory.map<FileInfo>(filePath => ({
        name: filePath.replace(RegExp(`^${targetDirectory}`), ''),
        type: 'file',
        uri: filePath.replace(RegExp(`^${targetDirectory}`), ''),
        mtime: 0,
        size: 0,
      })),
    };
  }

  async getUri(_: GetUriOptions): Promise<GetUriResult> {
    throw new Error('Method not implemented.');
  }

  async stat(_: StatOptions): Promise<StatResult> {
    throw new Error('Method not implemented.');
  }

  async rename(_: RenameOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async copy(_: CopyOptions): Promise<CopyResult> {
    throw new Error('Method not implemented.');
  }

  async downloadFile(_: DownloadFileOptions): Promise<DownloadFileResult> {
    throw new Error('Method not implemented.');
  }

  async addListener(
    _eventName: string,
    _listenerFunc: ProgressListener
  ): Promise<PluginListenerHandle> {
    throw new Error('Method not implemented.');
  }

  async removeAllListeners(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
