import { Injectable } from '@angular/core';
import { AdvertisingId } from '@capacitor-community/advertising-id';
import { Platform } from '@ionic/angular';
import { AFEvent, AFInit, AppsFlyer } from 'appsflyer-capacitor-plugin';
import { APPS_FLYER_DEV_KEY } from '../dia-backend/secret';

@Injectable({
  providedIn: 'root',
})
export class AppsFlyerService {
  private readonly afConfig: AFInit = {
    appID: '1536388009', // AppStore Application ID. For iOS only.
    devKey: APPS_FLYER_DEV_KEY,
    isDebug: true,
    waitForATTUserAuthorization: 15, // for iOS 14 and higher
    minTimeBetweenSessions: 6, // default 5 sec
    registerOnDeepLink: true,
    registerConversionListener: true,
    registerOnAppOpenAttribution: false,
    deepLinkTimeout: 4000, // default 3000 ms
    useReceiptValidationSandbox: true, // iOS only
    useUninstallSandbox: true, // iOS only
  };

  constructor(private readonly platform: Platform) {}

  async initAppFlyerSDK() {
    await this.platform.ready();
    if (this.isNativePlatform) {
      await AppsFlyer.initSDK(this.afConfig);
    }
    if (this.platform.is('ios')) {
      await AdvertisingId.requestTracking();
    }
  }

  async trackUserOpenedWalletsPage() {
    if (this.isNativePlatform) return;

    const data: AFEvent = { eventName: 'open-wallets-page' };

    return AppsFlyer.logEvent(data).catch(() => ({}));
  }

  private get isNativePlatform() {
    return this.platform.is('ios') || this.platform.is('android');
  }
}
