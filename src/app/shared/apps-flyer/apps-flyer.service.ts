import { Injectable } from '@angular/core';
import { AdvertisingId } from '@capacitor-community/advertising-id';
import { Capacitor } from '@capacitor/core';
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

  async initAppsFlyerSDK() {
    try {
      await this.platform.ready();

      if (this.shouldInit === false) return;

      await AdvertisingId.requestTracking();

      await AppsFlyer.initSDK(this.afConfig);
      console.log(`initAppsFlyerSDK SUCCESS`);
    } catch (error) {
      console.log(`initAppsFlyerSDK ERROR`);
      console.log(error);
      // TODO: report crashlytics
    }
  }

  private get shouldInit() {
    const isTruthy = Boolean(APPS_FLYER_DEV_KEY);
    return isTruthy && this.isNativePlatform;
  }

  async trackUserOpenedWalletsPage() {
    if (this.isNativePlatform) return;

    const data: AFEvent = { eventName: 'open-wallets-page' };

    return AppsFlyer.logEvent(data).catch(() => ({}));
  }

  // eslint-disable-next-line class-methods-use-this
  private get isNativePlatform() {
    return Capacitor.isNativePlatform();
  }
}
