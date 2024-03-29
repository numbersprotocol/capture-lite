import { Inject, Injectable } from '@angular/core';
import { StoragePlugin } from '@capacitor/storage';
import { STORAGE_PLUGIN } from '../capacitor-plugins/capacitor-plugins.module';
import { CapacitorStoragePreferences } from './preferences/capacitor-storage-preferences/capacitor-storage-preferences';
import { Preferences } from './preferences/preferences';

@Injectable({
  providedIn: 'root',
})
export class PreferenceManager {
  private readonly preferencesMap = new Map<string, Preferences>();

  constructor(
    @Inject(STORAGE_PLUGIN) private readonly storagePlugin: StoragePlugin
  ) {}

  getPreferences(id: string) {
    if (this.preferencesMap.has(id)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.preferencesMap.get(id)!;
    }
    return this.createPreferences(id);
  }

  private createPreferences(id: string) {
    const created = new CapacitorStoragePreferences(id, this.storagePlugin);
    this.preferencesMap.set(id, created);
    return created;
  }

  async clear() {
    return Promise.all(
      [...this.preferencesMap.values()].map(preferences => preferences.clear())
    );
  }
}
