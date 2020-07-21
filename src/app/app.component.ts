import { Component } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CollectorService } from './services/collector/collector.service';
import { DeviceProvider } from './services/collector/information/device-provider/device-provider';
import { InformationRepository } from './services/data/information/information-repository.service';
import { LanguageService } from './services/language/language.service';

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
    private readonly translateService: TranslateService,
    langaugeService: LanguageService
  ) {
    this.initializeApp();
    this.initializeCollector();
    langaugeService.init();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  initializeCollector() {
    this.collectorService.addInformationProvider(
      new DeviceProvider(this.informationRepository, this.translateService)
    );
  }
}
