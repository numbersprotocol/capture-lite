import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { concatMap } from 'rxjs/operators';
import { CollectorService } from './services/collector/collector.service';
import { CapacitorProvider } from './services/collector/facts/capacitor-provider/capacitor-provider';
import { WebCryptoApiProvider } from './services/collector/signature/web-crypto-api-provider/web-crypto-api-provider';
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
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private readonly platform: Platform,
    private readonly collectorService: CollectorService,
    private readonly publishersAlert: PublishersAlert,
    private readonly translocoService: TranslocoService,
    private readonly notificationService: NotificationService,
    private readonly numbersStorageApi: NumbersStorageApi,
    langaugeService: LanguageService,
    private readonly assetRepository: AssetRepository,
    private readonly iconRegistry: MatIconRegistry,
    private readonly sanitizer: DomSanitizer
  ) {
    this.restoreAppStatus();
    this.initializeApp();
    this.initializeCollector();
    this.initializePublisher();
    langaugeService.initialize$().pipe(untilDestroyed(this)).subscribe();
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
    WebCryptoApiProvider.initialize$().pipe(untilDestroyed(this)).subscribe();
    this.collectorService.addFactsProvider(new CapacitorProvider());
    this.collectorService.addSignatureProvider(new WebCryptoApiProvider());
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
