/* eslint-disable class-methods-use-this, @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PluginListenerHandle } from '@capacitor/core';
import {
  ConfigureOptions,
  MigrateResult,
  StoragePlugin,
} from '@capacitor/storage';

export class MockStoragePlugin implements StoragePlugin {
  private readonly map = new Map<string, string>();

  async get(options: { key: string }): Promise<{ value: string }> {
    return { value: this.map.get(options.key)! };
  }

  async set(options: { key: string; value: string }): Promise<void> {
    this.map.set(options.key, options.value);
  }

  async remove(options: { key: string }): Promise<void> {
    this.map.delete(options.key);
  }

  async clear(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async keys(): Promise<{ keys: string[] }> {
    throw new Error('Method not implemented.');
  }

  async configure(_options: ConfigureOptions): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async migrate(): Promise<MigrateResult> {
    throw new Error('Method not implemented.');
  }

  async removeOld(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  addListener(
    _eventName: string,
    _listenerFunc: () => any
  ): PluginListenerHandle {
    throw new Error('Method not implemented.');
  }
}
