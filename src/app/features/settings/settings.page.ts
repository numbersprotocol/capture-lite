import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject } from 'rxjs';
import { count, take, tap } from 'rxjs/operators';
import { LanguageService } from '../../shared/language/service/language.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  readonly langauges = this.languageService.languages;

  readonly currentLanguageKey$ = this.languageService.currentLanguageKey$;

  readonly hiddenOptionClicks$ = new Subject<void>();
  private readonly requiredClicks = 7;
  showHiddenOption = false;

  constructor(private readonly languageService: LanguageService) {}

  ionViewDidEnter() {
    this.hiddenOptionClicks$
      .pipe(
        take(this.requiredClicks),
        count(),
        tap(() => {
          this.showHiddenOption = true;
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async setCurrentLanguage(event: Event) {
    const customEvent = event as CustomEvent<HTMLIonSelectElement>;
    return this.languageService.setCurrentLanguage(customEvent.detail.value);
  }

  public onSettingsToolbarClicked() {
    this.hiddenOptionClicks$.next();
  }
}
