import { Inject, Injectable, Type } from '@angular/core';
import { Preferences, PREFERENCES_IMPL } from './preferences/preferences';

@Injectable({
  providedIn: 'root',
})
export class PreferenceManager {
  private readonly preferencesMap = new Map<string, Preferences>();

  constructor(
    @Inject(PREFERENCES_IMPL) private readonly PreferenceImpl: Type<Preferences>
  ) {}

  getPreferences(id: string) {
    if (this.preferencesMap.has(id)) {
      // tslint:disable-next-line: no-non-null-assertion
      return this.preferencesMap.get(id)!;
    }
    return this.createPreferences(id);
  }

  private createPreferences(id: string) {
    const created = new this.PreferenceImpl(id);
    this.preferencesMap.set(id, created);
    return created;
  }
}
