import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { CollectorService } from './services/collector/collector.service';
import { CapacitorFactsProvider } from './services/collector/facts/capacitor-facts-provider/capacitor-facts-provider.service';
import { WebCryptoApiSignatureProvider } from './services/collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { LanguageService } from './services/language/language.service';
import { NotificationService } from './services/notification/notification.service';
import { NumbersStorageApi } from './services/publisher/numbers-storage/numbers-storage-api.service';
import { NumbersStoragePublisher } from './services/publisher/numbers-storage/numbers-storage-publisher';
import { AssetRepository } from './services/publisher/numbers-storage/repositories/asset/asset-repository.service';
import { PublishersAlert } from './services/publisher/publishers-alert/publishers-alert.service';
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
    private readonly publishersAlert: PublishersAlert,
    private readonly translocoService: TranslocoService,
    private readonly notificationService: NotificationService,
    private readonly numbersStorageApi: NumbersStorageApi,
    private readonly assetRepository: AssetRepository,
    private readonly iconRegistry: MatIconRegistry,
    private readonly sanitizer: DomSanitizer,
    private readonly capacitorFactsProvider: CapacitorFactsProvider,
    private readonly webCryptoApiSignatureProvider: WebCryptoApiSignatureProvider,
    langaugeService: LanguageService
  ) {
    notificationService.requestPermission();
    langaugeService.initialize();
    this.restoreAppStatus();
    this.initializeApp();
    this.initializeCollector();
    this.initializePublisher();
    this.registerIcon();
  }

  async restoreAppStatus() {
    const photo = await restoreKilledCapture();
    const proof = await this.collectorService.runAndStore({
      [photo.base64]: { mimeType: photo.mimeType },
    });
    return this.publishersAlert.presentOrPublish(proof);
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

  initializePublisher() {
    this.publishersAlert.addPublisher(
      new NumbersStoragePublisher(
        this.translocoService,
        this.notificationService,
        this.numbersStorageApi,
        this.assetRepository
      )
    );
  }

  registerIcon() {
    this.iconRegistry.addSvgIcon(
      'media-id',
      this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/media-id.svg')
    );
  }
}
