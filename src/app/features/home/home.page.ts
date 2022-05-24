import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import {
  ActionSheetController,
  AlertController,
  Platform,
} from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, defer, EMPTY, iif, of } from 'rxjs';
import {
  catchError,
  concatMap,
  first,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { CameraService } from '../../shared/camera/camera.service';
import { CaptureService, Media } from '../../shared/capture/capture.service';
import { ConfirmAlert } from '../../shared/confirm-alert/confirm-alert.service';
import { DiaBackendAssetRepository } from '../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendTransactionRepository } from '../../shared/dia-backend/transaction/dia-backend-transaction-repository.service';
import { DiaBackendWalletService } from '../../shared/dia-backend/wallet/dia-backend-wallet.service';
import { ErrorService } from '../../shared/error/error.service';
import { MigrationService } from '../../shared/migration/service/migration.service';
import { OnboardingService } from '../../shared/onboarding/onboarding.service';
import { UserGuideService } from '../../shared/user-guide/user-guide.service';
import { switchTapTo, VOID$ } from '../../utils/rx-operators/rx-operators';
import { GoProBluetoothService } from '../settings/go-pro/services/go-pro-bluetooth.service';
import { PrefetchingDialogComponent } from './onboarding/prefetching-dialog/prefetching-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  selectedTabIndex = 0;

  readonly username$ = this.diaBackendAuthService.username$;

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
    private readonly platform: Platform
  ) {
    this.downloadExpiredPostCaptures();
  }

  ionViewDidEnter() {
    of(this.onboardingService.isNewLogin)
      .pipe(
        concatMap(isNewLogin => this.migrationService.migrate$(isNewLogin)),
        catchError(() => VOID$),
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
    if (
      this.platform.is('ios') &&
      (await this.onboardingService.hasShownTutorialVersion()) === ''
    ) {
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

  capture() {
    return defer(() => {
      const captureIndex = 0;
      this.selectedTabIndex = captureIndex;
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
    const captureIndex = 0;
    this.selectedTabIndex = captureIndex;
    this.router.navigate(['home', 'custom-camera']);
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
  openCaptureClub() {
    this.diaBackendAuthService.token$
      .pipe(
        first(),
        switchMap(token =>
          Browser.open({
            url: `https://captureclub.cc/?token=${token}`,
            toolbarColor: '#564dfc',
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async navigateToInboxTab() {
    await this.userGuideService.showUserGuidesOnInboxTab();
    await this.userGuideService.setHasOpenedInboxTab(true);
  }
}
