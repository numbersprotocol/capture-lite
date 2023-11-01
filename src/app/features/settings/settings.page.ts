import { Component, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Clipboard } from '@capacitor/clipboard';
import { IonModal } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY, Subject, defer, forkJoin } from 'rxjs';
import {
  catchError,
  concatMapTo,
  count,
  first,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { BlockingActionService } from '../../shared/blocking-action/blocking-action.service';
import { CapacitorFactsProvider } from '../../shared/collector/facts/capacitor-facts-provider/capacitor-facts-provider.service';
import { CaptureAppWebCryptoApiSignatureProvider } from '../../shared/collector/signature/capture-app-web-crypto-api-signature-provider/capture-app-web-crypto-api-signature-provider.service';
import { ConfirmAlert } from '../../shared/confirm-alert/confirm-alert.service';
import { Database } from '../../shared/database/database.service';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';
import { ErrorService } from '../../shared/error/error.service';
import { LanguageService } from '../../shared/language/service/language.service';
import { MediaStore } from '../../shared/media/media-store/media-store.service';
import { PreferenceManager } from '../../shared/preference-manager/preference-manager.service';
import { VersionService } from '../../shared/version/version.service';
import { reloadApp } from '../../utils/miscellaneous';
import {
  CustomCameraService,
  SaveToCameraRollDecision,
} from '../home/custom-camera/custom-camera.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  readonly langauges = this.languageService.languages;

  readonly currentLanguageKey$ = this.languageService.currentLanguageKey$;

  readonly isDeviceInfoCollectionEnabled$ =
    this.capacitorFactsProvider.isDeviceInfoCollectionEnabled$;
  readonly isLocationInfoCollectionEnabled$ =
    this.capacitorFactsProvider.isGeolocationInfoCollectionEnabled$;
  readonly isSaveToCameraRollEnabled$ =
    this.customCameraService.isSaveToCameraRollEnabled$;

  readonly email$ = this.diaBackendAuthService.email$;
  readonly emailVerified$ = this.diaBackendAuthService.emailVerified$;
  readonly emailVerifiedIcon$ = this.emailVerified$.pipe(
    map(verified =>
      verified ? 'checkmark-done-circle-outline' : 'alert-circle-outline'
    )
  );
  readonly emailVerifiedIconColor$ = this.emailVerified$.pipe(
    map(verified => (verified ? 'primary' : 'danger'))
  );

  readonly version$ = this.versionService.version$;

  readonly hiddenOptionClicks$ = new Subject<void>();
  private readonly requiredClicks = 7;
  showHiddenOption = false;

  private readonly privateKey$ =
    this.capAppWebCryptoApiSignatureProvider.privateKey$;
  readonly privateKeyTruncated$ = this.privateKey$.pipe(
    map(key => {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      return `${key.slice(0, 6)}******${key.slice(key.length - 6)}`;
    })
  );

  @ViewChild('modal') modal?: IonModal;

  constructor(
    private readonly languageService: LanguageService,
    private readonly database: Database,
    private readonly preferenceManager: PreferenceManager,
    private readonly mediaStore: MediaStore,
    private readonly blockingActionService: BlockingActionService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly confirmAlert: ConfirmAlert,
    private readonly capacitorFactsProvider: CapacitorFactsProvider,
    private readonly versionService: VersionService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly capAppWebCryptoApiSignatureProvider: CaptureAppWebCryptoApiSignatureProvider,
    private readonly snackBar: MatSnackBar,
    private readonly customCameraService: CustomCameraService
  ) {}

  ionViewWillEnter() {
    forkJoin([this.diaBackendAuthService.syncUser$()])
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  ionViewDidEnter() {
    this.hiddenOptionClicks$
      .pipe(
        take(this.requiredClicks),
        count(),
        tap(() => {
          this.showHiddenOption = true;
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async setCurrentLanguage(event: Event) {
    const customEvent = event as CustomEvent<HTMLIonSelectElement>;
    return this.languageService.setCurrentLanguage(customEvent.detail.value);
  }

  public onSettingsToolbarClicked() {
    this.hiddenOptionClicks$.next();
  }

  async setDeviceInfoCollection(event: any) {
    const enable = Boolean(event.detail.checked);
    return this.capacitorFactsProvider.setDeviceInfoCollection(enable);
  }

  async setLocationInfoCollection(event: any) {
    const enable = Boolean(event.detail.checked);
    return this.capacitorFactsProvider.setGeolocationInfoCollection(enable);
  }

  async setShouldSaveToCameraRoll(event: any) {
    const enable = Boolean(event.detail.checked);
    const shouldSave = enable
      ? SaveToCameraRollDecision.YES
      : SaveToCameraRollDecision.NO;
    return this.customCameraService.setShouldSaveToCameraRoll(shouldSave);
  }

  emailVerification() {
    this.emailVerified$
      .pipe(
        first(),
        switchMap(emailVerified => {
          if (emailVerified) return EMPTY;
          return this.router.navigate(['email-verification'], {
            relativeTo: this.route,
          });
        })
      )
      .subscribe();
  }

  async confirmDelete() {
    const confirmed = await this.confirmAlert.present({
      message: this.translocoService.translate('message.confirmDelete'),
    });
    if (!confirmed) return;
    this.modal?.present();
  }

  async copyPrivateKeyToClipboard() {
    return this.privateKey$
      .pipe(
        first(),
        switchMap(privateKey => Clipboard.write({ string: privateKey })),
        tap(() => {
          this.snackBar.open(
            this.translocoService.translate('message.copiedToClipboard')
          );
        })
      )
      .subscribe();
  }

  async deleteAccount() {
    const email: string = await this.diaBackendAuthService.getEmail();

    const action$ = this.diaBackendAuthService.deleteAccount$(email).pipe(
      // logout
      concatMapTo(defer(() => this.mediaStore.clear())),
      concatMapTo(defer(() => this.database.clear())),
      concatMapTo(defer(() => this.preferenceManager.clear())),
      concatMapTo(defer(reloadApp)),
      catchError((err: unknown) => this.errorService.toastError$(err))
    );

    return this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}
