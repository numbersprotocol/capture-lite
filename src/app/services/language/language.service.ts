import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { mapTo, switchMap } from 'rxjs/operators';
import { defaultLanguage, languages } from 'src/app/transloco-root.module';
import { PreferenceManager } from '../../utils/preferences/preference-manager';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private readonly preferences = PreferenceManager.LANGUAGE_PREF;
  private readonly prefKeys = {
    langauge: 'langauge'
  };
  readonly languages = languages;
  readonly defaultLanguage = defaultLanguage;
  readonly currentLanguageKey$ = this.preferences.get$(this.prefKeys.langauge, defaultLanguage[0]);

  constructor(
    private readonly translocoService: TranslocoService
  ) { }

  initialize$() {
    this.translocoService.setDefaultLang(defaultLanguage[0]);
    return this.currentLanguageKey$.pipe(switchMap(key => this.setCurrentLanguage$(key)));
  }

  setCurrentLanguage$(key: string) {
    return this.preferences.set$(this.prefKeys.langauge, key).pipe(
      mapTo(this.translocoService.setActiveLang(key)),
      mapTo(key)
    );
  }
}
