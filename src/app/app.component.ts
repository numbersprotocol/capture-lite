import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { CollectorService } from './services/collector/collector.service';
import { DeviceProvider } from './services/collector/information/device-provider/device-provider';
import { DefaultSignatureProvider } from './services/collector/signature/default-provider/default-provider';
import { InformationRepository } from './services/data/information/information-repository.service';
import { SignatureRepository } from './services/data/signature/signature-repository.service';
import { LanguageService } from './services/language/language.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private readonly platform: Platform,
    private readonly splashScreen: SplashScreen,
    private readonly statusBar: StatusBar,
    private readonly collectorService: CollectorService,
    private readonly informationRepository: InformationRepository,
    private readonly signatureRepository: SignatureRepository,
    private readonly translateService: TranslateService,
    langaugeService: LanguageService
  ) {
    this.initializeApp();
    this.initializeCollector();
    langaugeService.initialize$().pipe(untilDestroyed(this)).subscribe();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  initializeCollector() {
    DefaultSignatureProvider.initialize$().pipe(untilDestroyed(this)).subscribe();
    this.collectorService.addInformationProvider(
      new DeviceProvider(this.informationRepository, this.translateService)
    );
    this.collectorService.addSignatureProvider(
      new DefaultSignatureProvider(this.signatureRepository, this.informationRepository)
    );
  }
}
