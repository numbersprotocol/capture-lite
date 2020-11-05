import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LanguageService } from 'src/app/services/language/language.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  readonly langauges = this.languageService.languages;
  readonly currentLanguageKey$ = this.languageService.currentLanguageKey$;

  constructor(
    private readonly languageService: LanguageService
  ) { }

  setCurrentLanguage(languageKey: string) {
    this.languageService.setCurrentLanguage$(languageKey).pipe(
      untilDestroyed(this)
    ).subscribe();
  }
}
