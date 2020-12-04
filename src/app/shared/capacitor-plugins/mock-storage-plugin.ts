// tslint:disable: prefer-function-over-method no-async-without-await no-non-null-assertion
import { PluginListenerHandle, StoragePlugin } from '@capacitor/core';

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

  addListener(
    eventName: string,
    listenerFunc: () => any
  ): PluginListenerHandle {
    throw new Error('Method not implemented.');
  }
}
