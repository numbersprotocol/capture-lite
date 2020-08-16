import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CollectorService } from './services/collector/collector.service';
import { CapacitorProvider } from './services/collector/information/capacitor-provider/capacitor-provider';
import { DefaultSignatureProvider } from './services/collector/signature/default-provider/default-provider';
import { CaptionRepository } from './services/data/caption/caption-repository.service';
import { InformationRepository } from './services/data/information/information-repository.service';
import { ProofRepository } from './services/data/proof/proof-repository.service';
import { SignatureRepository } from './services/data/signature/signature-repository.service';
import { LanguageService } from './services/language/language.service';
import { NotificationService } from './services/notification/notification.service';
import { NumbersStorageApi } from './services/publisher/numbers-storage/numbers-storage-api.service';
import { NumbersStoragePublisher } from './services/publisher/numbers-storage/numbers-storage-publisher';
import { PublishersAlert } from './services/publisher/publishers-alert/publishers-alert.service';
import { SerializationService } from './services/serialization/serialization.service';

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
    langaugeService: LanguageService
  ) {
    this.initializeApp();
    this.initializeCollector();
    this.initializePublisher();
    langaugeService.initialize$().pipe(untilDestroyed(this)).subscribe();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
    });
  }

  initializeCollector() {
    DefaultSignatureProvider.initialize$().pipe(untilDestroyed(this)).subscribe();
    this.collectorService.addInformationProvider(
      new CapacitorProvider(this.informationRepository, this.translocoService)
    );
    this.collectorService.addSignatureProvider(
      new DefaultSignatureProvider(this.signatureRepository, this.serializationService)
    );
  }

  initializePublisher() {
    this.publishersAlert.addPublisher(
      new NumbersStoragePublisher(
        this.translocoService,
        this.notificationService,
        this.proofRepository,
        this.informationRepository,
        this.signatureRepository,
        this.captionRepository,
        this.numbersStorageApi)
    );
  }
}
