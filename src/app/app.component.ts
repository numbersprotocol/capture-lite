import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, concatMap } from 'rxjs/operators';
import { CameraService } from './shared/camera/camera.service';
import { CaptureService } from './shared/capture/capture.service';
import { CollectorService } from './shared/collector/collector.service';
import { CapacitorFactsProvider } from './shared/collector/facts/capacitor-facts-provider/capacitor-facts-provider.service';
import { WebCryptoApiSignatureProvider } from './shared/collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { DiaBackendAssetUploadingService } from './shared/dia-backend/asset/uploading/dia-backend-asset-uploading.service';
import { DiaBackendAuthService } from './shared/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendNotificationService } from './shared/dia-backend/notification/dia-backend-notification.service';
import { ErrorService } from './shared/error/error.service';
import { InAppStoreService } from './shared/in-app-store/in-app-store.service';
import { LanguageService } from './shared/language/service/language.service';
import { NotificationService } from './shared/notification/notification.service';
import { PushNotificationService } from './shared/push-notification/push-notification.service';

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
    private readonly captureService: CaptureService,
    private readonly cameraService: CameraService,
    private readonly errorService: ErrorService,
    private readonly inAppStoreService: InAppStoreService,
    notificationService: NotificationService,
    pushNotificationService: PushNotificationService,
    langaugeService: LanguageService,
    diaBackendAuthService: DiaBackendAuthService,
    diaBackendNotificationService: DiaBackendNotificationService,
    uploadService: DiaBackendAssetUploadingService
  ) {
    notificationService.requestPermission();
    pushNotificationService.register();
    langaugeService.initialize();
    diaBackendAuthService.initialize$().pipe(untilDestroyed(this)).subscribe();
    uploadService.initialize$().pipe(untilDestroyed(this)).subscribe();
    diaBackendNotificationService
      .initialize$()
      .pipe(untilDestroyed(this))
      .subscribe();
    this.inAppStoreService.initialize();
    this.initializeApp();
    this.restoreAppState();
    this.initializeCollector();
    this.registerIcon();
  }

  static setDarkMode() {
    const dark =
      window.navigator.userAgent.includes('AndroidDarkMode') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', dark);
  }

  async initializeApp() {
    await this.platform.ready();
    AppComponent.setDarkMode();
    await SplashScreen.hide();
  }

  private restoreAppState() {
    this.cameraService.restoreKilledCaptureEvent$
      .pipe(
        concatMap(photo => this.captureService.capture(photo)),
        catchError((err: unknown) => this.errorService.toastError$(err)),
        untilDestroyed(this)
      )
      .subscribe();
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
      'media-id-solid-black',
      this.sanitizer.bypassSecurityTrustResourceUrl(
        '/assets/images/media-id-solid-black.svg'
      )
    );
  }
}
