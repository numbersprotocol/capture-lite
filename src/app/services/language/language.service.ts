import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { first, mapTo, switchMap, tap } from 'rxjs/operators';
import {
  defaultLanguage,
  languages,
} from '../../transloco/transloco-root.module';
import { PreferenceManager } from '../../utils/preferences/preference-manager';

const preferences = PreferenceManager.LANGUAGE_PREF;
const enum PrefKeys {
  Language = 'language',
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  readonly languages = languages;
  readonly defaultLanguage = defaultLanguage;
  readonly currentLanguageKey$ = preferences.getString$(
    PrefKeys.Language,
    defaultLanguage[0]
  );

  constructor(private readonly translocoService: TranslocoService) {}

  initialize$() {
    this.translocoService.setDefaultLang(defaultLanguage[0]);
    return this.currentLanguageKey$.pipe(
      first(),
      switchMap(key => this.setCurrentLanguage$(key))
    );
  }

  setCurrentLanguage$(key: string) {
    return preferences.setString$(PrefKeys.Language, key).pipe(
      tap(_ => this.translocoService.setActiveLang(key)),
      mapTo(key)
    );
  }
}
