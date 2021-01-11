import { Inject, Injectable } from '@angular/core';
import { StoragePlugin } from '@capacitor/core';
import { STORAGE_PLUGIN } from '../../../shared/core/capacitor-plugins/capacitor-plugins.module';
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
      // tslint:disable-next-line: no-non-null-assertion
      return this.preferencesMap.get(id)!;
    }
    return this.createPreferences(id);
  }

  private createPreferences(id: string) {
    const created = new CapacitorStoragePreferences(id, this.storagePlugin);
    this.preferencesMap.set(id, created);
    return created;
  }
}
