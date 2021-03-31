/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
import {
  CopyOptions,
  CopyResult,
  FileAppendOptions,
  FileAppendResult,
  FileDeleteOptions,
  FileDeleteResult,
  FileReadOptions,
  FileReadResult,
  FilesystemPlugin,
  FileWriteOptions,
  FileWriteResult,
  GetUriOptions,
  GetUriResult,
  MkdirOptions,
  MkdirResult,
  PluginListenerHandle,
  ReaddirOptions,
  ReaddirResult,
  RenameOptions,
  RenameResult,
  RmdirOptions,
  RmdirResult,
  StatOptions,
  StatResult,
} from '@capacitor/core';
import { groupBy } from 'lodash';
import {
  base64ToString,
  stringToBase64,
} from '../../../utils/encoding/encoding';

export class MockFilesystemPlugin implements FilesystemPlugin {
  private readonly files = new Map<string, string>();

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
    if (!options.encoding) {
      this.files.set(path, options.data);
    } else {
      this.files.set(path, stringToBase64(options.data));
    }
    return { uri: path };
  }

  async appendFile(options: FileAppendOptions): Promise<FileAppendResult> {
    const result = await this.readFile(options);
    const newData = `${result.data}${options.data}`;
    await this.writeFile({ ...options, data: newData });
    return {};
  }

  async deleteFile(options: FileDeleteOptions): Promise<FileDeleteResult> {
    const path = `${options.directory ?? ''}/${options.path}`;
    this.files.delete(path);
    return {};
  }

  async mkdir(_: MkdirOptions): Promise<MkdirResult> {
    return {};
  }

  async rmdir(_: RmdirOptions): Promise<RmdirResult> {
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
      files: directory.map(filePath =>
        filePath.replace(RegExp(`^${targetDirectory}`), '')
      ),
    };
  }

  async getUri(_: GetUriOptions): Promise<GetUriResult> {
    throw new Error('Method not implemented.');
  }

  async stat(_: StatOptions): Promise<StatResult> {
    throw new Error('Method not implemented.');
  }

  async rename(_: RenameOptions): Promise<RenameResult> {
    throw new Error('Method not implemented.');
  }

  async copy(_: CopyOptions): Promise<CopyResult> {
    throw new Error('Method not implemented.');
  }

  addListener(
    _eventName: string,
    _listenerFunc: () => any
  ): PluginListenerHandle {
    throw new Error('Method not implemented.');
  }
}
