import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';
import { CameraService } from './services/camera/camera.service';
import { CollectorService } from './services/collector/collector.service';
import { CapacitorProvider } from './services/collector/information/capacitor-provider/capacitor-provider';
import { WebCryptoApiProvider } from './services/collector/signature/web-crypto-api-provider/web-crypto-api-provider';
import { CaptionRepository } from './services/data/caption/caption-repository.service';
import { InformationRepository } from './services/data/information/information-repository.service';
import { ProofRepository } from './services/data/proof/proof-repository.service';
import { SignatureRepository } from './services/data/signature/signature-repository.service';
import { LanguageService } from './services/language/language.service';
import { NotificationService } from './services/notification/notification.service';
import { AssetRepository } from './services/publisher/numbers-storage/data/asset/asset-repository.service';
import { NumbersStorageApi } from './services/publisher/numbers-storage/numbers-storage-api.service';
import { NumbersStoragePublisher } from './services/publisher/numbers-storage/numbers-storage-publisher';
import { PublishersAlert } from './services/publisher/publishers-alert/publishers-alert.service';
import { SerializationService } from './services/serialization/serialization.service';
import { fromExtension } from './utils/mime-type';

const { SplashScreen } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private readonly platform: Platform,
    private readonly collectorService: CollectorService,
    private readonly publishersAlert: PublishersAlert,
    private readonly serializationService: SerializationService,
    private readonly proofRepository: ProofRepository,
    private readonly informationRepository: InformationRepository,
    private readonly signatureRepository: SignatureRepository,
    private readonly captionRepository: CaptionRepository,
    private readonly translocoService: TranslocoService,
    private readonly notificationService: NotificationService,
    private readonly numbersStorageApi: NumbersStorageApi,
    langaugeService: LanguageService,
    private readonly cameraService: CameraService,
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
    this.cameraService.restoreKilledAppResult$().pipe(
      map(cameraPhoto => this.collectorService.storeAndCollect(
        cameraPhoto.base64String,
        fromExtension(cameraPhoto.format)
      )),
      untilDestroyed(this)
    ).subscribe();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
    });
  }

  initializeCollector() {
    WebCryptoApiProvider.initialize$().pipe(untilDestroyed(this)).subscribe();
    this.collectorService.addInformationProvider(
      new CapacitorProvider(this.informationRepository, this.translocoService)
    );
    this.collectorService.addSignatureProvider(
      new WebCryptoApiProvider(this.signatureRepository, this.serializationService)
    );
  }

  initializePublisher() {
    this.publishersAlert.addPublisher(
      new NumbersStoragePublisher(
        this.translocoService,
        this.notificationService,
        this.proofRepository,
        this.signatureRepository,
        this.captionRepository,
        this.numbersStorageApi,
        this.assetRepository
      )
    );
  }

  registerIcon() {
    this.iconRegistry.addSvgIcon('media-id', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icon/media-id.svg'));
  }
}
