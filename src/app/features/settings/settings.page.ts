import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ErrorReportService } from '../../shared/modules/error/error-report.service';
import { LanguageService } from '../../shared/services/language/language.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  readonly langauges = this.languageService.languages;

  readonly currentLanguageKey$ = this.languageService.currentLanguageKey$;

  readonly errorReportEnabled$ = this.errorReportService.enabled$;

  constructor(
    private readonly languageService: LanguageService,
    private readonly errorReportService: ErrorReportService
  ) {}

  async setCurrentLanguage(event: Event) {
    const customEvent = event as CustomEvent<HTMLIonSelectElement>;
    return this.languageService.setCurrentLanguage(customEvent.detail.value);
  }

  async setErrorReportEnabled(event: Event) {
    const customEvent = event as CustomEvent<HTMLIonToggleElement>;
    return this.errorReportService.setEnabled(customEvent.detail.checked);
  }
}
