import { Injectable } from '@angular/core';
import { AdvertisingId } from '@capacitor-community/advertising-id';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { AFEvent, AFInit, AppsFlyer } from 'appsflyer-capacitor-plugin';
import { APPS_FLYER_DEV_KEY } from '../dia-backend/secret';
import { CCamCustomEventType } from './apps-flyer-enums';

@Injectable({
  providedIn: 'root',
})
export class AppsFlyerService {
  private readonly INIT_TIMEOUT_MS = 2000;
  private readonly afConfig: AFInit = {
    appID: '1536388009', // AppStore Application ID. For iOS only.
    devKey: APPS_FLYER_DEV_KEY,
    isDebug: false,
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

      /**
       * Initializes the AppsFlyer SDK with the configuration.
       * This promise is used to track the initialization status.
       *
       * Note: This is a workaround to prevent AppsFlyer.initSDK from not resolving
       * after Android hot reload.
       */
      const initPromise = AppsFlyer.initSDK(this.afConfig);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('AppsFlyer initialization timed out')),
          this.INIT_TIMEOUT_MS
        );
      });

      await Promise.race([initPromise, timeoutPromise]);
    } catch (error) {
      // TODO: Report error to Crashlytics or any other error reporting service if available.
    }
  }

  /**
   * Determines whether AppsFlyer should be initialized.
   * In APK debug or QA builds, we pass an empty string ("") as the APPS_FLYER_DEV_KEY
   * to prevent AppsFlyer initialization. This approach helps avoid unnecessary analytics
   * or install counts in development (DEV) or quality assurance (QA) builds.
   * AppsFlyer will only be initialized if the following conditions are met:
   * 1. The APPS_FLYER_DEV_KEY is truthy (not an empty string).
   * 2. The app is running on a native platform (e.g., a mobile device).
   *
   * @returns {boolean} True if AppsFlyer should be initialized, otherwise false.
   */
  // eslint-disable-next-line class-methods-use-this
  private get shouldInit() {
    const isTruthy = Boolean(APPS_FLYER_DEV_KEY);
    return isTruthy && Capacitor.isNativePlatform();
  }

  // eslint-disable-next-line class-methods-use-this
  private async logEvent(event: AFEvent) {
    try {
      await AppsFlyer.logEvent(event);
    } catch (error) {
      // TODO: Report error to Crashlytics or any other error reporting service if available.
    }
  }

  /**
   * Logs a camera shutter event to AppsFlyer.
   *
   * This event is logged when the user clicks the camera shutter button to take a photo or video.
   * It does not necessarily indicate the registering of a photo or video, only the act of clicking
   * the shutter button.
   *
   */
  async logCameraShutterEvent() {
    const eventData: AFEvent = {
      eventName: CCamCustomEventType.CCAM_TRY_CLICK_CAMERA_SHUTTER,
    };
    await this.logEvent(eventData);
  }
}
