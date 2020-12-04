import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import {
  defaultLanguage,
  languages,
} from '../../services/transloco/transloco-root.module';
import { PreferenceManager } from '../preference-manager/preference-manager.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly preferences = this.preferenceManager.getPreferences(
    LanguageService.name
  );
  readonly languages = languages;
  readonly defaultLanguage = defaultLanguage;
  readonly currentLanguageKey$ = this.preferences.getString$(
    PrefKeys.LANGUAGE,
    defaultLanguage[0]
  );

  constructor(
    private readonly preferenceManager: PreferenceManager,
    private readonly translocoService: TranslocoService
  ) {}

  async initialize() {
    this.translocoService.setDefaultLang(defaultLanguage[0]);
    this.setCurrentLanguage(await this.getCurrentLanguageKey());
  }

  async getCurrentLanguageKey() {
    return this.preferences.getString(PrefKeys.LANGUAGE, defaultLanguage[0]);
  }

  async setCurrentLanguage(key: string) {
    await this.preferences.setString(PrefKeys.LANGUAGE, key);
    this.translocoService.setActiveLang(key);
    return key;
  }
}

const enum PrefKeys {
  LANGUAGE = 'LANGUAGE',
}
