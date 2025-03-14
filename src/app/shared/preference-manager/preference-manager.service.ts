import { Inject, Injectable } from '@angular/core';
import { PreferencesPlugin } from '@capacitor/preferences';
import { PREFERENCES_PLUGIN } from '../capacitor-plugins/capacitor-plugins.module';
import { CapacitorStoragePreferences } from './preferences/capacitor-storage-preferences/capacitor-storage-preferences';

@Injectable({
  providedIn: 'root',
})
export class PreferenceManager {
  private readonly preferencesMap = new Map<
    string,
    CapacitorStoragePreferences
  >();

  constructor(
    @Inject(PREFERENCES_PLUGIN)
    private readonly preferencesPlugin: PreferencesPlugin
  ) {}

  getPreferences(id: string) {
    if (this.preferencesMap.has(id)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.preferencesMap.get(id)!;
    }
    return this.createPreferences(id);
  }

  private createPreferences(id: string) {
    const created = new CapacitorStoragePreferences(id, this.preferencesPlugin);
    this.preferencesMap.set(id, created);
    return created;
  }

  async clear() {
    return Promise.all(
      [...this.preferencesMap.values()].map(preferences => preferences.clear())
    );
  }
}
