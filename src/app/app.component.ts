import { Component, NgZone } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { Platform } from '@ionic/angular';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { catchError, concatMap } from 'rxjs/operators';
import { AppsFlyerService } from './shared/apps-flyer/apps-flyer.service';
import { CameraService } from './shared/camera/camera.service';
import { CaptureService } from './shared/capture/capture.service';
import { CollectorService } from './shared/collector/collector.service';
import { CapacitorFactsProvider } from './shared/collector/facts/capacitor-facts-provider/capacitor-facts-provider.service';
import { CaptureAppWebCryptoApiSignatureProvider } from './shared/collector/signature/capture-app-web-crypto-api-signature-provider/capture-app-web-crypto-api-signature-provider.service';
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
    private readonly capAppWebCryptoApiSignatureProvider: CaptureAppWebCryptoApiSignatureProvider,
    private readonly captureService: CaptureService,
    private readonly cameraService: CameraService,
    private readonly errorService: ErrorService,
    private readonly inAppStoreService: InAppStoreService,
    private readonly zone: NgZone,
    private readonly router: Router,
    private readonly appsFlyerService: AppsFlyerService,
    private readonly notificationService: NotificationService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly langaugeService: LanguageService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendNotificationService: DiaBackendNotificationService,
    private readonly uploadService: DiaBackendAssetUploadingService
  ) {
    this.initializeApp();
    this.initializeDeepLinking();
    this.restoreAppState();
    this.initializeCollector();
    this.registerIcon();
    this.registerCaptureRebrandedIcons();
  }

  static setDarkMode(forceDarkMode = false) {
    if (forceDarkMode) {
      document.body.classList.toggle('dark', true);
      return;
    }
    const dark =
      window.navigator.userAgent.includes('AndroidDarkMode') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', dark);
  }

  async initializeApp() {
    await this.platform.ready();
    AppComponent.setDarkMode(true);
    await SplashScreen.hide();

    await this.appsFlyerService.initAppsFlyerSDK();
    this.notificationService.requestPermission();
    this.pushNotificationService.register();
    this.langaugeService.initialize();
    this.diaBackendAuthService
      .initialize$()
      .pipe(untilDestroyed(this))
      .subscribe();
    this.uploadService.initialize$().pipe(untilDestroyed(this)).subscribe();
    this.diaBackendNotificationService
      .initialize$()
      .pipe(untilDestroyed(this))
      .subscribe();
    this.inAppStoreService.initialize();
  }

  async initializeDeepLinking() {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {
        const slug = event.url.split('.app').pop();
        if (slug) this.router.navigateByUrl(slug);
      });
    });
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
    this.capAppWebCryptoApiSignatureProvider.initialize();
    this.collectorService.addFactsProvider(this.capacitorFactsProvider);
    this.collectorService.addSignatureProvider(
      this.capAppWebCryptoApiSignatureProvider
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

  private registerCaptureRebrandedIcons() {
    const captureRebrandedIconNames = [
      'capture-rebrand-support',
      'capture-rebrand-arrow-left',
      'capture-rebrand-share',
      'capture-rebrand-more-horiz',
      'capture-reband-camera-grid',
      'capture-rebrand-camera-hq',
      'capture-rebrand-camera-low',
      'capture-rebrand-camera-auto-enhance',
      'capture-rebrand-camera-crop',
      'capture',
      'profile',
      'collection',
      'edit',
      'capture-rebrand-add',
    ];

    for (const iconName of captureRebrandedIconNames) {
      const iconPath = this.sanitizer.bypassSecurityTrustResourceUrl(
        `/assets/images/icons/${iconName}.svg`
      );
      this.iconRegistry.addSvgIcon(iconName, iconPath);
    }
  }
}
