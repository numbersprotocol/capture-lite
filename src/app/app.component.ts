import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { concatMap, first } from 'rxjs/operators';
import { CollectorService } from './services/collector/collector.service';
import { CapacitorFactsProvider } from './services/collector/facts/capacitor-facts-provider/capacitor-facts-provider.service';
import { WebCryptoApiSignatureProvider } from './services/collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { DiaBackendAssetRepository } from './services/dia-backend/asset/dia-backend-asset-repository.service';
import { LanguageService } from './services/language/language.service';
import { NotificationService } from './services/notification/notification.service';
import { restoreKilledCapture } from './utils/camera';

const { SplashScreen } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private readonly platform: Platform,
    private readonly collectorService: CollectorService,
    private readonly iconRegistry: MatIconRegistry,
    private readonly sanitizer: DomSanitizer,
    private readonly capacitorFactsProvider: CapacitorFactsProvider,
    private readonly webCryptoApiSignatureProvider: WebCryptoApiSignatureProvider,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    notificationService: NotificationService,
    langaugeService: LanguageService
  ) {
    notificationService.requestPermission();
    langaugeService.initialize();
    this.restoreAppStatus();
    this.initializeApp();
    this.initializeCollector();
    this.registerIcon();
  }

  restoreAppStatus() {
    return defer(restoreKilledCapture)
      .pipe(
        concatMap(photo =>
          this.collectorService.runAndStore({
            [photo.base64]: { mimeType: photo.mimeType },
          })
        ),
        concatMap(proof => this.diaBackendAssetRepository.add(proof)),
        first(),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async initializeApp() {
    await this.platform.ready();
    await SplashScreen.hide();
  }

  initializeCollector() {
    this.webCryptoApiSignatureProvider.initialize();
    this.collectorService.addFactsProvider(this.capacitorFactsProvider);
    this.collectorService.addSignatureProvider(
      this.webCryptoApiSignatureProvider
    );
  }

  registerIcon() {
    this.iconRegistry.addSvgIcon(
      'media-id',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/media-id.svg')
    );
  }
}
