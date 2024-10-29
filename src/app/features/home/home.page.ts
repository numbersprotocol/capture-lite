import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import {
  ActionSheetController,
  AlertController,
  NavController,
  Platform,
} from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY, combineLatest, defer, iif, of } from 'rxjs';
import {
  catchError,
  concatMap,
  concatMapTo,
  delay,
  distinctUntilChanged,
  filter,
  first,
  map,
  startWith,
  tap,
} from 'rxjs/operators';
import { AndroidBackButtonService } from '../../shared/android-back-button/android-back-button.service';
import { BlockingActionService } from '../../shared/blocking-action/blocking-action.service';
import { CameraService } from '../../shared/camera/camera.service';
import { CaptureService, Media } from '../../shared/capture/capture.service';
import { ConfirmAlert } from '../../shared/confirm-alert/confirm-alert.service';
import { Database } from '../../shared/database/database.service';
import { DiaBackendAssetRepository } from '../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendService } from '../../shared/dia-backend/service/dia-backend-service.service';
import { DiaBackendTransactionRepository } from '../../shared/dia-backend/transaction/dia-backend-transaction-repository.service';
import { DiaBackendWalletService } from '../../shared/dia-backend/wallet/dia-backend-wallet.service';
import { ErrorService } from '../../shared/error/error.service';
import { IframeService } from '../../shared/iframe/iframe.service';
import { MediaStore } from '../../shared/media/media-store/media-store.service';
import { MigrationService } from '../../shared/migration/service/migration.service';
import {
  OnboardingPopUpDialogComponent,
  OnboardingPopUpDialogData,
} from '../../shared/onboarding/onboarding-pop-up-dialog/onboarding-pop-up-dialog.component';
import { OnboardingService } from '../../shared/onboarding/onboarding.service';
import { PreferenceManager } from '../../shared/preference-manager/preference-manager.service';
import { UserGuideService } from '../../shared/user-guide/user-guide.service';
import { browserToolbarColor } from '../../utils/constants';
import { reloadApp } from '../../utils/miscellaneous';
import { VOID$, switchTapTo } from '../../utils/rx-operators/rx-operators';
import { getAppDownloadLink, getFaqUrl } from '../../utils/url';
import { GoProBluetoothService } from '../settings/go-pro/services/go-pro-bluetooth.service';
import { UpdateAppDialogComponent } from './in-app-updates/update-app-dialog/update-app-dialog.component';
import { PrefetchingDialogComponent } from './onboarding/prefetching-dialog/prefetching-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  readonly initialTabIndex = 0;
  private readonly afterCaptureTabIndex = 0;
  private readonly collectionTabIndex = 2;
  private shouldReloadWallet = false;
  selectedTabIndex = this.initialTabIndex;

  readonly profileName$ = this.diaBackendAuthService.profileName$;

  readonly hasNewInbox$ = this.diaBackendTransactionRepository.inbox$.pipe(
    catchError((err: unknown) => this.errorService.toastError$(err)),
    map(transactions => transactions.count !== 0),
    /**
     * WORKARDOUND: force changeDetection to update badge when returning to App
     * by clicking push notification
     */
    tap(() => this.changeDetectorRef.detectChanges()),
    startWith(false)
  );

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly diaBackendService: DiaBackendService,
    private readonly onboardingService: OnboardingService,
    private readonly router: Router,
    private readonly captureService: CaptureService,
    private readonly route: ActivatedRoute,
    private readonly confirmAlert: ConfirmAlert,
    private readonly dialog: MatDialog,
    private readonly translocoService: TranslocoService,
    private readonly migrationService: MigrationService,
    private readonly errorService: ErrorService,
    private readonly cameraService: CameraService,
    private readonly actionSheetController: ActionSheetController,
    private readonly alertController: AlertController,
    private readonly goProBluetoothService: GoProBluetoothService,
    private readonly diaBackendWalletService: DiaBackendWalletService,
    private readonly userGuideService: UserGuideService,
    private readonly platform: Platform,
    private readonly iframeService: IframeService,
    private readonly androidBackButtonService: AndroidBackButtonService,
    private readonly database: Database,
    private readonly preferenceManager: PreferenceManager,
    private readonly mediaStore: MediaStore,
    private readonly blockingActionService: BlockingActionService,
    private readonly navController: NavController
  ) {
    this.downloadExpiredPostCaptures();
    this.overrideAndroidBackButtonBehavior();
    this.encourageUserToTakePhoto();
    this.reloadWalletPage();
  }

  private reloadWalletPage() {
    this.diaBackendWalletService.reloadWallet$
      .pipe(
        tap(reload => {
          if (reload) {
            this.shouldReloadWallet = true;
            this.diaBackendWalletService.reloadWallet$.next(false);
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ionViewWillEnter() {
    if (this.shouldReloadWallet) {
      this.shouldReloadWallet = false;
      this.router.navigate(['wallets']);
    }
  }

  ionViewDidEnter() {
    of(this.onboardingService.isNewLogin)
      .pipe(
        concatMap(isNewLogin => this.migrationService.migrate$(isNewLogin)),
        catchError(() => VOID$),
        switchTapTo(defer(() => this.promptAppUpdateIfAny())),
        switchTapTo(defer(() => this.onboardingRedirect())),
        switchTapTo(
          defer(() => this.userGuideService.showUserGuidesOnHomePage())
        ),
        catchError((err: unknown) => this.errorService.toastError$(err)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private async onboardingRedirect() {
    if (await this.onboardingService.shouldShowOnboardingTutotrial()) {
      return this.router.navigate(['tutorial'], {
        relativeTo: this.route,
      });
    }

    this.onboardingService.isNewLogin = false;

    if (!(await this.onboardingService.hasCreatedOrImportedIntegrityWallet())) {
      this.migrationService
        .createOrImportDiaBackendIntegrityWallet$()
        .toPromise()
        .then(() =>
          this.onboardingService.setHasCreatedOrImportedIntegrityWallet(true)
        );
    }
    if (!(await this.onboardingService.hasSyncAssetWalletBalance())) {
      this.diaBackendWalletService
        .syncAssetWalletBalance$()
        .toPromise()
        .then(() => this.onboardingService.setHasSyncAssetWalletBalance(true));
    }

    if (
      !(await this.onboardingService.hasPrefetchedDiaBackendAssets()) &&
      (await this.diaBackendAssetRepository.fetchOriginallyOwnedCount$
        .pipe(first())
        .toPromise()) > 0
    ) {
      if (await this.showPrefetchAlert()) {
        return this.dialog.open(PrefetchingDialogComponent, {
          disableClose: true,
        });
      }
    }
    await this.onboardingService.setHasPrefetchedDiaBackendAssets(true);
  }

  /**
   * Displays a modal encouraging user to take a photo, if necessary.
   * Encourage pop up is delayed by 1 second to avoid overwhelming users
   * with app start prompts, such as onboarding slides or restore captures popups.
   */
  async encourageUserToTakePhoto() {
    this.onboardingService.shouldEncourageUserToTakePhoto$
      .pipe(
        filter(shouldEncourage => shouldEncourage === true),
        distinctUntilChanged(),
        delay(OnboardingService.ONBOARDING_POP_UP_DELAY),
        map(() => this.showEncourageUserToTakePhotoPopUpDialog()),
        tap(() => this.onboardingService.setDidEncourageUserToTakePhoto(true)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private showEncourageUserToTakePhotoPopUpDialog() {
    const panelClass = 'onboarding-pop-up-dialog';
    const data: OnboardingPopUpDialogData = {
      title: this.translocoService.translate(
        'onboarding.createCapturePopUp.title'
      ),
      content: this.translocoService.translate(
        'onboarding.createCapturePopUp.content'
      ),
      close: this.translocoService.translate(
        'onboarding.createCapturePopUp.close'
      ),
    };
    return this.dialog.open(OnboardingPopUpDialogComponent, {
      panelClass,
      data,
    });
  }

  private async promptAppUpdateIfAny() {
    if (!this.platform.is('hybrid')) return;

    const backendAppInfo = await this.diaBackendService.appInfo$().toPromise();
    const appInfo = await App.getInfo();

    const current = appInfo.version;
    const latest = backendAppInfo.latest_app_version;

    if (this.isEqualOrGreaterThanLatestVersion(current, latest)) return;

    if (backendAppInfo.update_urgency === 'critical') {
      this.dialog.open(UpdateAppDialogComponent, { disableClose: true });
    }

    if (
      backendAppInfo.update_urgency === 'high' &&
      (await this.diaBackendService.postponedMoreThanOneDayAgo())
    ) {
      this.diaBackendService.setAppUpdatePromptTimestamp(Date.now());
      const confirmAppUpdate = await this.showAppUpdateAlert();
      if (confirmAppUpdate) await this.redirectToAppUpdatePage();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  isEqualOrGreaterThanLatestVersion(
    currentVersion: string,
    latestVersion: string
  ) {
    const currentVersionArray = currentVersion.split('.');
    const latestVersionArray = latestVersion.split('.');

    for (const index in currentVersionArray) {
      if (currentVersionArray[index] > latestVersionArray[index]) {
        return true;
      } else if (currentVersionArray[index] < latestVersionArray[index]) {
        return false;
      }
    }
    return true;
  }

  private async redirectToAppUpdatePage() {
    const url = getAppDownloadLink(this.platform.is.bind(this));
    await Browser.open({ url });
  }

  private async showAppUpdateAlert() {
    return this.confirmAlert.present({
      header: this.translocoService.translate(
        'inAppUpdate.importantUpdatesAreAvailable'
      ),
      message: this.translocoService.translate(
        'inAppUpdate.pleaseUpdateTheAppForProperFunctioning'
      ),
      confirmButtonText: this.translocoService.translate(
        'inAppUpdate.updateNow'
      ),
      cancelButtonText: this.translocoService.translate(
        'inAppUpdate.remindMeTomorrow'
      ),
    });
  }

  private async showPrefetchAlert() {
    return this.confirmAlert.present({
      header: this.translocoService.translate('restorePhotos'),
      message: this.translocoService.translate('message.confirmPrefetch'),
      confirmButtonText: this.translocoService.translate('restore'),
      cancelButtonText: this.translocoService.translate('skip'),
    });
  }

  private downloadExpiredPostCaptures() {
    return defer(() => this.onboardingService.hasPrefetchedDiaBackendAssets())
      .pipe(
        concatMap(hasPrefetched =>
          iif(
            () => hasPrefetched,
            this.diaBackendTransactionRepository.downloadExpired$
          )
        ),
        catchError((err: unknown) => this.errorService.toastError$(err)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  /**
   * WORKAROUND: override android back button default
   * behavior to ensure capture ionic navigaiton and
   * capture app iframe navigatioins behave as expected.
   */
  overrideAndroidBackButtonBehavior() {
    this.androidBackButtonService
      .overrideAndroidBackButtonBehavior$(() => {
        const shouldNavigateBackCollectionTabIframe =
          this.selectedTabIndex === this.collectionTabIndex &&
          this.router.url === '/home';
        if (shouldNavigateBackCollectionTabIframe) {
          this.iframeService.navigateBackCollectionTabIframe();
        } else {
          this.navController.back();
        }
      })
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  capture() {
    return defer(() => {
      this.selectedTabIndex = this.afterCaptureTabIndex;
      return this.presentCaptureActions$();
    })
      .pipe(
        concatMap(media => this.captureService.capture(media)),
        catchError((err: unknown) => {
          if (err !== 'User cancelled photos app')
            return this.errorService.toastError$(err);
          return EMPTY;
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  captureWithCustomCamera() {
    if (!this.platform.is('hybrid')) {
      this.capture();
    } else {
      this.selectedTabIndex = this.afterCaptureTabIndex;
      this.router.navigate(['home', 'custom-camera']);
    }
  }

  private presentCaptureActions$() {
    return combineLatest([
      this.translocoService.selectTranslateObject({
        takePicture: null,
        recordVideo: null,
      }),
      this.goProBluetoothService.lastConnectedDevice$,
    ]).pipe(
      first(),
      concatMap(([translations, connectedDevice]) => {
        const [takePicture, recordVideo] = translations;

        return new Promise<Media>(resolve => {
          const buttons = [
            {
              text: takePicture,
              handler: () => resolve(this.cameraService.takePhoto()),
            },
            {
              text: recordVideo,
              handler: () => resolve(this.recordVideo()),
            },
          ];

          if (connectedDevice) {
            buttons.push({
              text: 'Capture from GoPro',
              handler: () => resolve(this.caputureFromGoPro()),
            });
          }

          return this.actionSheetController
            .create({ buttons })
            .then(sheet => sheet.present());
        });
      })
    );
  }

  private async recordVideo() {
    return new Promise<Media>(resolve => {
      this.alertController
        .create({
          header: this.translocoService.translate('videoLimitation'),
          message: this.translocoService.translate('message.videoLimitation'),
          backdropDismiss: false,
          buttons: [
            {
              text: this.translocoService.translate('message.yesIUnderstand'),
              handler: () => resolve(this.cameraService.recordVideo()),
            },
          ],
        })
        .then(alert => alert.present());
    });
  }

  private async caputureFromGoPro() {
    return new Promise<Media>(() => {
      this.router.navigate(['/settings', 'go-pro', 'media-list-on-camera']);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async navigateToCollectionTab() {
    if (this.selectedTabIndex === this.collectionTabIndex) {
      // window.location.reload();
      this.iframeService.refreshCollectionTabIframe();
    }
    /* TODO: re-enable or remove the popup.
        Hide the popup in current version as a temporary decision.
    const didExplain = await this.onboardingService.didExplainCollectionTab();
    if (didExplain === false) {
      await new Promise(resolve => {
        setTimeout(resolve, OnboardingService.ONBOARDING_POP_UP_DELAY);
      });
      this.showExplainCollectionTabPopUpDialog();
      this.onboardingService.setDidExplainCollectionTab(true);
    }
    */
  }

  private showExplainCollectionTabPopUpDialog() {
    const panelClass = 'onboarding-pop-up-dialog';
    const data: OnboardingPopUpDialogData = {
      title: this.translocoService.translate(
        'onboarding.explainCollectionTabPopUp.title'
      ),
      content: this.translocoService.translate(
        'onboarding.explainCollectionTabPopUp.content'
      ),
      close: this.translocoService.translate(
        'onboarding.explainCollectionTabPopUp.close'
      ),
    };
    return this.dialog.open(OnboardingPopUpDialogComponent, {
      panelClass,
      data,
    });
  }

  async navigateToInboxTab() {
    await this.userGuideService.showUserGuidesOnInboxTab();
    await this.userGuideService.setHasOpenedInboxTab(true);
  }

  logout() {
    const action$ = defer(() => this.mediaStore.clear()).pipe(
      concatMapTo(defer(() => this.database.clear())),
      concatMapTo(defer(() => this.preferenceManager.clear())),
      concatMapTo(defer(reloadApp)),
      catchError((err: unknown) => this.errorService.toastError$(err))
    );
    return defer(() =>
      this.confirmAlert.present({
        message: this.translocoService.translate('message.confirmLogout'),
      })
    )
      .pipe(
        concatMap(result =>
          iif(() => result, this.blockingActionService.run$(action$))
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  // eslint-disable-next-line class-methods-use-this
  async openFaq() {
    await Browser.open({ url: getFaqUrl(), toolbarColor: browserToolbarColor });
  }
}
