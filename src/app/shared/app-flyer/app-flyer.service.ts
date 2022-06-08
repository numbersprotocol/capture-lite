import { Injectable } from '@angular/core';
import { AdvertisingId } from '@capacitor-community/advertising-id';
import { Platform } from '@ionic/angular';
import { AFInit, AppsFlyer } from 'appsflyer-capacitor-plugin';
import { environment } from '../../../environments/environment';
import { APP_FLYER_DEV_KEY } from '../dia-backend/secret';

@Injectable({
  providedIn: 'root',
})
export class AppFlyerService {
  private readonly afConfig: AFInit = {
    appID: '1536388009', // AppStore Application ID. For iOS only.
    devKey: APP_FLYER_DEV_KEY,
    isDebug: !environment.production,
    waitForATTUserAuthorization: 10, // for iOS 14 and higher
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
    if (this.platform.is('ios')) {
      await AdvertisingId.requestTracking();
    }
    if (this.isNativePlatform) {
      await AppsFlyer.initSDK(this.afConfig);
    }
  }

  private get isNativePlatform() {
    return this.platform.is('ios') || this.platform.is('android');
  }
}
