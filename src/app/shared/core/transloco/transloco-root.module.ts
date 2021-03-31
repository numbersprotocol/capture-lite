import { HttpClient } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import {
  getBrowserCultureLang,
  Translation,
  translocoConfig,
  TranslocoLoader,
  TranslocoModule,
  TRANSLOCO_CONFIG,
  TRANSLOCO_LOADER,
} from '@ngneat/transloco';
import { environment } from '../../../../environments/environment';

export const languages: { [key: string]: string } = {
  'en-us': 'English (United State)',
  'zh-tw': '繁體中文（台灣）',
};

export const defaultLanguage =
  Object.entries(languages).find(
    pair => pair[0] === getBrowserCultureLang().toLowerCase()
  ) ?? Object.entries(languages)[0];

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string) {
    return this.http.get<Translation>(`./assets/i18n/${lang}.json`);
  }
}

@NgModule({
  exports: [TranslocoModule],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: Object.keys(languages),
        defaultLang: defaultLanguage[0],
        fallbackLang: defaultLanguage[0],
        missingHandler: { useFallbackTranslation: true },
        reRenderOnLangChange: true,
        prodMode: environment.production,
      }),
    },
    { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader },
  ],
})
export class TranslocoRootModule {}
