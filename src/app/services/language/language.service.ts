import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { first, map, switchMap } from 'rxjs/operators';
import { PreferencesService } from '../preferences/preferences.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private readonly preferences = PreferencesService.languagePref;
  readonly languages: { [key: string]: string; } = {
    'en-us': 'English (United State)',
    'zh-tw': '繁體中文（台灣）'
  };
  readonly defaultLanguage = Object.entries(this.languages)[0];
  readonly currentLanguageKey$ = this.preferences.get('languageKey', this.defaultLanguage[0]);

  constructor(
    private readonly translateService: TranslateService
  ) { }

  init() {
    this.translateService.setDefaultLang(this.defaultLanguage[0]);
    this.currentLanguageKey$.pipe(
      switchMap(key => this.setCurrentLanguage(key)),
      first(),
    ).subscribe();
  }

  setCurrentLanguage(key: string) {
    return this.preferences.set('languageKey', key).pipe(
      switchMap(_ => this.translateService.use(key)),
      map(_ => key)
    );
  }
}
