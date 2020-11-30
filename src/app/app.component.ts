import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { concatMap } from 'rxjs/operators';
import { CollectorService } from './services/collector/collector.service';
import { CapacitorFactsProvider } from './services/collector/facts/capacitor-provider/capacitor-facts-provider.service';
import { WebCryptoApiSignatureProvider } from './services/collector/signature/web-crypto-api-provider/web-crypto-api-signature-provider.service';
import { LanguageService } from './services/language/language.service';
import { NotificationService } from './services/notification/notification.service';
import { NumbersStorageApi } from './services/publisher/numbers-storage/numbers-storage-api.service';
import { NumbersStoragePublisher } from './services/publisher/numbers-storage/numbers-storage-publisher';
import { AssetRepository } from './services/publisher/numbers-storage/repositories/asset/asset-repository.service';
import { PublishersAlert } from './services/publisher/publishers-alert/publishers-alert.service';
import { restoreKilledAppResult$ } from './utils/camera';
import { fromExtension } from './utils/mime-type';

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

  restoreAppStatus() {
    restoreKilledAppResult$()
      .pipe(
        concatMap(cameraPhoto =>
          this.collectorService.runAndStore({
            [cameraPhoto.base64String]: {
              mimeType: fromExtension(cameraPhoto.format),
            },
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
    });
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
