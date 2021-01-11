import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { concatMap, concatMapTo, first } from 'rxjs/operators';
import { CollectorService } from './shared/services/collector/collector.service';
import { CapacitorFactsProvider } from './shared/services/collector/facts/capacitor-facts-provider/capacitor-facts-provider.service';
import { WebCryptoApiSignatureProvider } from './shared/services/collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { DiaBackendAssetRepository } from './shared/services/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from './shared/services/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendNotificationService } from './shared/services/dia-backend/notification/dia-backend-notification.service';
import { LanguageService } from './shared/services/language/language.service';
import { NotificationService } from './shared/services/notification/notification.service';
import { PushNotificationService } from './shared/services/push-notification/push-notification.service';
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
    pushNotificationService: PushNotificationService,
    langaugeService: LanguageService,
    diaBackendAuthService: DiaBackendAuthService,
    diaBackendNotificationService: DiaBackendNotificationService
  ) {
    notificationService.requestPermission();
    pushNotificationService.register();
    langaugeService.initialize();
    diaBackendAuthService.initialize$().pipe(untilDestroyed(this)).subscribe();
    diaBackendNotificationService
      .initialize$()
      .pipe(untilDestroyed(this))
      .subscribe();
    this.restoreAppStatus();
    this.initializeApp();
    this.initializeCollector();
    this.registerIcon();
  }

  // TODO: Error if user logout during app killed. Use BehaviorSubject instead.
  //       Extract this to a standalone CameraService.
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
        concatMapTo(this.diaBackendAssetRepository.refresh$()),
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
