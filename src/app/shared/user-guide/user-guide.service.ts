import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { JoyrideService } from 'ngx-joyride';
import { PreferenceManager } from '../preference-manager/preference-manager.service';

@Injectable({
  providedIn: 'root',
})
export class UserGuideService {
  private readonly preferences =
    this.preferenceManager.getPreferences('UserGuideService');

  private readonly showCounter = false;

  private readonly userGuideIsTemporarelyDisabled = true;

  constructor(
    private readonly preferenceManager: PreferenceManager,
    private readonly joyrideService: JoyrideService,
    private readonly translocoService: TranslocoService,
    private readonly platform: Platform
  ) {}

  // eslint-disable-next-line class-methods-use-this
  private async delayBeforeStartTour(delayInMilliseconds = 700) {
    return new Promise(resolve => setTimeout(resolve, delayInMilliseconds));
  }

  private get customTexts() {
    const done = this.translocoService.translate('userGuide.okIGotIt');
    const prev = this.translocoService.translate('userGuide.previous');
    const next = this.translocoService.translate('userGuide.next');
    return { prev, next, done };
  }

  async showUserGuidesOnHomePage() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.userGuideIsTemporarelyDisabled) return;

    if (this.platform.is('ios')) return;

    if ((await this.hasHighlightedCameraTab()) === false) {
      await this.delayBeforeStartTour();
      this.joyrideService.startTour({
        steps: ['highlightCaptureButton'],
        showCounter: this.showCounter,
        customTexts: this.customTexts,
      });
      this.setHasHighlightedCameraTab(true);
    } else if ((await this.hasHighlightedFirstCapture()) === false) {
      await this.delayBeforeStartTour();
      this.joyrideService.startTour({
        steps: ['highlightFirstCapture'],
        showCounter: this.showCounter,
        customTexts: this.customTexts,
      });
      this.setHasHighlightedFirstCapture(true);
    } else if (
      (await this.hasClickedDetailsPageOptionsMenu()) === true &&
      (await this.hasHighligtedActivityButton()) === false
    ) {
      await this.delayBeforeStartTour();
      this.joyrideService.startTour({
        steps: ['highlightActivityButton'],
        showCounter: this.showCounter,
        customTexts: this.customTexts,
      });
      this.setHasHighligtedActivityButton(true);
    } else if (
      (await this.hasOpenedActivitiesPage()) === true &&
      (await this.hasHightlightedInboxTab()) === false
    ) {
      await this.delayBeforeStartTour();
      this.joyrideService.startTour({
        steps: ['highlightInboxTab'],
        showCounter: this.showCounter,
        customTexts: this.customTexts,
      });
      this.setHasHightlightedInboxTab(true);
    }
  }

  async showUserGuidesOnCustomCameraPage() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.userGuideIsTemporarelyDisabled) return;

    if (this.platform.is('ios')) return;

    if ((await this.hasOpenedCustomCameraPage()) === false) {
      const avarageTimeToGetCameraPermissions = 1400;
      await this.delayBeforeStartTour(avarageTimeToGetCameraPermissions);
      this.joyrideService.startTour({
        steps: [
          'highlightCustomCameraCaptureButton',
          'highlightCustomCameraFlipButton',
          'highlightCustomCameraCloseButton',
        ],
        customTexts: this.customTexts,
      });
    }
  }

  async showUserGuidesOnActivitiesPage() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.userGuideIsTemporarelyDisabled) return;

    if (this.platform.is('ios')) return;

    if ((await this.hasOpenedActivitiesPage()) === false) {
      await this.delayBeforeStartTour();
      this.joyrideService.startTour({
        customTexts: this.customTexts,
        steps: [
          'highlightCaptureTransactionsTab',
          'highlightNetworkActionsTab',
        ],
      });
    }
  }

  async showUserGuidesOnDetailsPage() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.userGuideIsTemporarelyDisabled) return;

    if (this.platform.is('ios')) return;

    if ((await this.hasClickedDetailsPageOptionsMenu()) === false) {
      await this.delayBeforeStartTour();
      this.joyrideService.startTour({
        customTexts: this.customTexts,
        steps: ['highlightDetailsPageOptionsMenu'],
        showCounter: this.showCounter,
      });
    }
  }

  async showUserGuidesOnInboxTab() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.userGuideIsTemporarelyDisabled) return;

    if (this.platform.is('ios')) return;

    if ((await this.hasOpenedInboxTab()) === false) {
      await this.delayBeforeStartTour();
      this.joyrideService.startTour({
        customTexts: this.customTexts,
        steps: ['highlightImageView', 'highlightCollectionView'],
      });
    }
  }

  hasHighlightedCameraTab$() {
    return this.preferences.getBoolean$(
      PrefKeys.HAS_HIGHLIGHTED_CAMERA_TAB,
      false
    );
  }

  async hasHighlightedCameraTab() {
    return this.preferences.getBoolean(
      PrefKeys.HAS_HIGHLIGHTED_CAMERA_TAB,
      false
    );
  }

  async setHasHighlightedCameraTab(value: boolean) {
    return this.preferences.setBoolean(
      PrefKeys.HAS_HIGHLIGHTED_CAMERA_TAB,
      value
    );
  }

  hasOpenedCustomCameraPage$() {
    return this.preferences.getBoolean$(
      PrefKeys.HAS_OPENED_CUSTOM_CAMERA_PAGE,
      false
    );
  }

  async hasOpenedCustomCameraPage() {
    return this.preferences.getBoolean(
      PrefKeys.HAS_OPENED_CUSTOM_CAMERA_PAGE,
      false
    );
  }

  async setHasOpenedCustomCameraPage(value: boolean) {
    return this.preferences.setBoolean(
      PrefKeys.HAS_OPENED_CUSTOM_CAMERA_PAGE,
      value
    );
  }

  hasCapturedPhotoWithCustomCamera$() {
    return this.preferences.getBoolean$(
      PrefKeys.HAS_CAPTURED_PHOTO_WITH_CUSTOM_CAMERA,
      false
    );
  }

  async hasCapturedPhotoWithCustomCamera() {
    return await this.preferences.getBoolean(
      PrefKeys.HAS_CAPTURED_PHOTO_WITH_CUSTOM_CAMERA,
      false
    );
  }

  async setHasCapturedPhotoWithCustomCamera(value: boolean) {
    return this.preferences.setBoolean(
      PrefKeys.HAS_CAPTURED_PHOTO_WITH_CUSTOM_CAMERA,
      value
    );
  }

  hasCapturedVideoWithCustomCamera$() {
    return this.preferences.getBoolean$(
      PrefKeys.HAS_CAPTURED_VIDEO_WITH_CUSTOM_CAMERA,
      false
    );
  }

  async hasCapturedVideoWithCustomCamera() {
    return await this.preferences.getBoolean(
      PrefKeys.HAS_CAPTURED_VIDEO_WITH_CUSTOM_CAMERA,
      false
    );
  }

  async setHasCapturedVideoWithCustomCamera(value: boolean) {
    return this.preferences.setBoolean(
      PrefKeys.HAS_CAPTURED_VIDEO_WITH_CUSTOM_CAMERA,
      value
    );
  }

  private async hasCapturePhotoOrVideoWithCustomCamera() {
    return (
      (await this.hasCapturedVideoWithCustomCamera()) === true ||
      (await this.hasCapturedPhotoWithCustomCamera()) === true
    );
  }

  hasHighlightedFirstCapture$() {
    return this.preferences.getBoolean$(
      PrefKeys.HAS_HIGHLIGHTED_FIRST_CAPTURE,
      false
    );
  }

  async hasHighlightedFirstCapture() {
    return await this.preferences.getBoolean(
      PrefKeys.HAS_HIGHLIGHTED_FIRST_CAPTURE,
      false
    );
  }

  async setHasHighlightedFirstCapture(value: boolean) {
    return await this.preferences.setBoolean(
      PrefKeys.HAS_HIGHLIGHTED_FIRST_CAPTURE,
      value
    );
  }

  hasOpenedDetailsPage$() {
    return this.preferences.getBoolean$(
      PrefKeys.HAS_OPENED_DETAILS_PAGE,
      false
    );
  }

  async hasOpenedDetailsPage() {
    return await this.preferences.getBoolean(
      PrefKeys.HAS_OPENED_DETAILS_PAGE,
      false
    );
  }

  async setHasOpenedDetailsPage(value: boolean) {
    return await this.preferences.setBoolean(
      PrefKeys.HAS_OPENED_DETAILS_PAGE,
      value
    );
  }

  hasClickedDetailsPageOptionsMenu$() {
    return this.preferences.getBoolean$(
      PrefKeys.HAS_CLICKED_DETAILS_PAGE_OPTIONS_MENU,
      false
    );
  }

  async hasClickedDetailsPageOptionsMenu() {
    return await this.preferences.getBoolean(
      PrefKeys.HAS_CLICKED_DETAILS_PAGE_OPTIONS_MENU,
      false
    );
  }

  async setHasClickedDetailsPageOptionsMenu(value: boolean) {
    return this.preferences.setBoolean(
      PrefKeys.HAS_CLICKED_DETAILS_PAGE_OPTIONS_MENU,
      value
    );
  }

  hasHighligtedActivityButton$() {
    return this.preferences.getBoolean$(
      PrefKeys.HAS_HIGHLIGHTED_ACTIVITY_BUTTON,
      false
    );
  }

  async hasHighligtedActivityButton() {
    return this.preferences.getBoolean(
      PrefKeys.HAS_HIGHLIGHTED_ACTIVITY_BUTTON,
      false
    );
  }
  async setHasHighligtedActivityButton(value: boolean) {
    return this.preferences.setBoolean(
      PrefKeys.HAS_HIGHLIGHTED_ACTIVITY_BUTTON,
      value
    );
  }

  hasOpenedActivitiesPage$() {
    return this.preferences.getBoolean$(
      PrefKeys.HAS_OPENED_ACTIVITIES_PAGE,
      false
    );
  }

  async hasOpenedActivitiesPage() {
    return this.preferences.getBoolean(
      PrefKeys.HAS_OPENED_ACTIVITIES_PAGE,
      false
    );
  }
  async setHasOpenedActivitiesPage(value: boolean) {
    return this.preferences.setBoolean(
      PrefKeys.HAS_OPENED_ACTIVITIES_PAGE,
      value
    );
  }

  hasHightlightedInboxTab$() {
    return this.preferences.getBoolean$(
      PrefKeys.HAS_HIGHLIGHTED_INBOX_TAB,
      false
    );
  }

  async hasHightlightedInboxTab() {
    return await this.preferences.getBoolean(
      PrefKeys.HAS_HIGHLIGHTED_INBOX_TAB,
      false
    );
  }

  async setHasHightlightedInboxTab(value: boolean) {
    return this.preferences.setBoolean(
      PrefKeys.HAS_HIGHLIGHTED_INBOX_TAB,
      value
    );
  }

  hasOpenedInboxTab$() {
    return this.preferences.getBoolean$(PrefKeys.HAS_OPENED_INBOX_TAB, false);
  }

  async hasOpenedInboxTab() {
    return await this.preferences.getBoolean(
      PrefKeys.HAS_OPENED_INBOX_TAB,
      false
    );
  }

  async setHasOpenedInboxTab(value: boolean) {
    return this.preferences.setBoolean(PrefKeys.HAS_OPENED_INBOX_TAB, value);
  }
}

export interface UserGuideBasicCaptureFlow {
  openCamera: boolean;
  takePhoto: boolean;
  takeVideo: boolean;
  closeCamera: boolean;
  openAnyCapturedItem: boolean;
  openNetworkActions: boolean;
}

export interface UserGuide {
  joyrideStep: string;
  title: string;
  text: string;
  expectedUrlPath: string;
}

const enum PrefKeys {
  HAS_HIGHLIGHTED_CAMERA_TAB = 'HAS_HIGHLIGHTED_CAMERA_TAB',
  HAS_OPENED_CUSTOM_CAMERA_PAGE = 'HAS_OPENED_CUSTOM_CAMERA_PAGE',
  HAS_CAPTURED_PHOTO_WITH_CUSTOM_CAMERA = 'HAS_CAPTURED_PHOTO_WITH_CUSTOM_CAMERA',
  HAS_CAPTURED_VIDEO_WITH_CUSTOM_CAMERA = 'HAS_CAPTURED_VIDEO_WITH_CUSTOM_CAMERA',
  HAS_HIGHLIGHTED_FIRST_CAPTURE = 'HAS_HIGHLIGHTED_FIRST_CAPTURE',
  HAS_OPENED_DETAILS_PAGE = 'HAS_OPENED_DETAILS_PAGE',
  HAS_CLICKED_DETAILS_PAGE_OPTIONS_MENU = 'HAS_CLICKED_DETAILS_PAGE_OPTIONS_MENU',
  HAS_OPENED_ACTIVITIES_PAGE = 'HAS_OPENED_ACTIVITIES_PAGE',
  HAS_HIGHLIGHTED_ACTIVITY_BUTTON = 'HAS_HIGHLIGHTED_ACTIVITY_BUTTON',
  HAS_HIGHLIGHTED_INBOX_TAB = 'HAS_HIGHLIGHTED_INBOX_TAB',
  HAS_OPENED_INBOX_TAB = 'HAS_OPENED_INBOX_TAB',
}
