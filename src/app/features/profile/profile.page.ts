import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Plugins } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer, iif } from 'rxjs';
import { catchError, concatMap, concatMapTo } from 'rxjs/operators';
import { ErrorService } from '../../shared/modules/error/error.service';
import { BlockingActionService } from '../../shared/services/blocking-action/blocking-action.service';
import { WebCryptoApiSignatureProvider } from '../../shared/services/collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { ConfirmAlert } from '../../shared/services/confirm-alert/confirm-alert.service';
import { Database } from '../../shared/services/database/database.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { MediaStore } from '../../shared/services/media-store/media-store.service';
import { PreferenceManager } from '../../shared/services/preference-manager/preference-manager.service';

const { Clipboard } = Plugins;

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  readonly username$ = this.diaBackendAuthService.username$;
  readonly email$ = this.diaBackendAuthService.email$;
  readonly publicKey$ = this.webCryptoApiSignatureProvider.publicKey$;
  readonly privateKey$ = this.webCryptoApiSignatureProvider.privateKey$;

  constructor(
    private readonly database: Database,
    private readonly preferenceManager: PreferenceManager,
    private readonly imageStore: MediaStore,
    private readonly blockingActionService: BlockingActionService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService,
    private readonly snackBar: MatSnackBar,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly webCryptoApiSignatureProvider: WebCryptoApiSignatureProvider,
    private readonly confirmAlert: ConfirmAlert,
    private readonly alertController: AlertController
  ) {}

  async editUsername() {
    const alert = await this.alertController.create({
      header: this.translocoService.translate('editUsername'),
      inputs: [
        {
          name: 'username',
          type: 'text',
          value: await this.diaBackendAuthService.getUsername(),
        },
      ],
      buttons: [
        {
          text: this.translocoService.translate('cancel'),
          role: 'cancel',
        },
        {
          text: this.translocoService.translate('ok'),
          handler: value => this.updateUsername(value.username),
        },
      ],
    });
    return alert.present();
  }

  private updateUsername(username: string) {
    const action$ = this.diaBackendAuthService.updateUser$({ username });
    return this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  async copyToClipboard(value: string) {
    await Clipboard.write({ string: value });
    this.snackBar.open(
      this.translocoService.translate('message.copiedToClipboard')
    );
  }

  logout() {
    const action$ = defer(() => this.imageStore.clear()).pipe(
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
}

// Reload the app to force app to re-run the initialization in AppModule.
function reloadApp() {
  location.href = 'index.html';
}
