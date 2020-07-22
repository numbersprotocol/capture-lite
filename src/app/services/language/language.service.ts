import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { mapTo, switchMap, switchMapTo } from 'rxjs/operators';
import { PreferenceManager } from '../../utils/preferences/preference-manager';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private readonly preferences = PreferenceManager.LANGUAGE_PREF;
  private readonly prefKeys = {
    langauge: 'langauge'
  };

  readonly languages: { [key: string]: string; } = {
    'en-us': 'English (United State)',
    'zh-tw': '繁體中文（台灣）'
  };
  readonly defaultLanguage = Object.entries(this.languages)[0];
  readonly currentLanguageKey$ = this.preferences.get$(this.prefKeys.langauge, this.defaultLanguage[0]);

  constructor(
    private readonly translateService: TranslateService
  ) { }

  initialize$() {
    this.translateService.setDefaultLang(this.defaultLanguage[0]);
    return this.currentLanguageKey$.pipe(switchMap(key => this.setCurrentLanguage$(key)));
  }

  setCurrentLanguage$(key: string) {
    return this.preferences.set$(this.prefKeys.langauge, key).pipe(
      switchMapTo(this.translateService.use(key)),
      mapTo(key)
    );
  }
}
