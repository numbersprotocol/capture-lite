import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Plugins } from '@capacitor/core';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer, iif } from 'rxjs';
import { catchError, concatMap, concatMapTo } from 'rxjs/operators';
import { BlockingActionService } from '../../shared/services/blocking-action/blocking-action.service';
import { WebCryptoApiSignatureProvider } from '../../shared/services/collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { ConfirmAlert } from '../../shared/services/confirm-alert/confirm-alert.service';
import { Database } from '../../shared/services/database/database.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { ImageStore } from '../../shared/services/image-store/image-store.service';
import { PreferenceManager } from '../../shared/services/preference-manager/preference-manager.service';
import { VOID$ } from '../../utils/rx-operators/rx-operators';

const { Clipboard } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  readonly username$ = this.diaBackendAuthService.getUsername$;
  readonly email$ = this.diaBackendAuthService.getEmail$;
  readonly publicKey$ = this.webCryptoApiSignatureProvider.getPublicKey$();
  readonly privateKey$ = this.webCryptoApiSignatureProvider.getPrivateKey$();

  constructor(
    private readonly database: Database,
    private readonly preferenceManager: PreferenceManager,
    private readonly imageStore: ImageStore,
    private readonly blockingActionService: BlockingActionService,
    private readonly toastController: ToastController,
    private readonly translocoService: TranslocoService,
    private readonly snackBar: MatSnackBar,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly webCryptoApiSignatureProvider: WebCryptoApiSignatureProvider,
    private readonly confirmAlert: ConfirmAlert
  ) {}

  async copyToClipboard(value: string) {
    await Clipboard.write({ string: value });
    this.snackBar.open(
      this.translocoService.translate('message.copiedToClipboard')
    );
  }

  logout() {
    const INCORRECT_CREDENTIAL_ERROR = 401;
    const action$ = this.diaBackendAuthService.logout$().pipe(
      catchError(err =>
        iif(
          () =>
            err instanceof HttpErrorResponse &&
            err.status === INCORRECT_CREDENTIAL_ERROR,
          VOID$,
          defer(() => this.presentErrorToast(err))
        )
      ),
      concatMapTo(defer(() => this.imageStore.clear())),
      concatMapTo(defer(() => this.database.clear())),
      concatMapTo(defer(() => this.preferenceManager.clear())),
      concatMapTo(defer(reloadApp)),
      catchError(err => this.presentErrorToast(err))
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

  private async presentErrorToast(err: any) {
    return this.toastController
      .create({
        message:
          err instanceof HttpErrorResponse ? err.message : JSON.stringify(err),
        duration: 4000,
      })
      .then(toast => toast.present());
  }
}

// Reload the app to force app to re-run the initialization in AppModule.
function reloadApp() {
  location.href = 'index.html';
}
