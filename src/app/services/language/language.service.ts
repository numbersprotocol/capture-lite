import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  readonly languages: Langauge[] = [{
    name: 'English (United State)',
    value: 'en-us'
  }, {
    name: '繁體中文（台灣）',
    value: 'zh-tw'
  }];

  readonly defaultLanguage = this.languages[0];

  constructor(
    private readonly translateService: TranslateService
  ) { }

  init() {
    this.translateService.setDefaultLang(this.defaultLanguage.value);
  }

  setCurrentLanguage(langauge: Langauge) {
    return this.translateService.use(langauge.value);
  }

  getCurrentLanguage() {
    return this.translateService.currentLang;
  }
}

interface Langauge {
  name: string;
  value: string;
}

