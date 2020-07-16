import { Component } from '@angular/core';
import { LanguageService } from 'src/app/services/language/language.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  readonly langauges = this.languageService.languages;
  readonly defaultLanguage = this.languageService.defaultLanguage;
  readonly currentLanguageKey$ = this.languageService.currentLanguageKey$;

  constructor(
    private readonly languageService: LanguageService
  ) { }

  setCurrentLanguage(languageKey: string) {
    this.languageService.setCurrentLanguage(languageKey).subscribe();
  }
}
