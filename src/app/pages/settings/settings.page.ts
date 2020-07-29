import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { DefaultSignatureProvider } from 'src/app/services/collector/signature/default-provider/default-provider';
import { LanguageService } from 'src/app/services/language/language.service';

const { Device } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  readonly langauges = this.languageService.languages;
  readonly defaultLanguage = this.languageService.defaultLanguage;
  readonly currentLanguageKey$ = this.languageService.currentLanguageKey$;
  readonly publicKey$ = DefaultSignatureProvider.getPublicKey$();
  readonly privateKey$ = DefaultSignatureProvider.getPrivateKey$();
  readonly version$ = defer(() => Device.getInfo()).pipe(
    first(),
    map(deviceInfo => deviceInfo.appVersion)
  );

  constructor(
    private readonly languageService: LanguageService
  ) { }

  setCurrentLanguage(languageKey: string) {
    this.languageService.setCurrentLanguage$(languageKey).pipe(
      untilDestroyed(this)
    ).subscribe();
  }
}
