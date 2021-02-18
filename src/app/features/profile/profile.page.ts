import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Plugins } from '@capacitor/core';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { catchError, concatMapTo } from 'rxjs/operators';
import { BlockingActionService } from '../../shared/services/blocking-action/blocking-action.service';
import { WebCryptoApiSignatureProvider } from '../../shared/services/collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { Database } from '../../shared/services/database/database.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';
import { ImageStore } from '../../shared/services/image-store/image-store.service';
import { PreferenceManager } from '../../shared/services/preference-manager/preference-manager.service';

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
    private readonly webCryptoApiSignatureProvider: WebCryptoApiSignatureProvider
  ) {}

  async copyToClipboard(value: string) {
    await Clipboard.write({ string: value });
    this.snackBar.open(
      this.translocoService.translate('message.copiedToClipboard')
    );
  }

  logout() {
    const action$ = this.diaBackendAuthService.logout$().pipe(
      concatMapTo(defer(() => this.imageStore.clear())),
      concatMapTo(defer(() => this.database.clear())),
      concatMapTo(defer(() => this.preferenceManager.clear())),
      concatMapTo(defer(reloadApp)),
      catchError(err =>
        this.toastController
          .create({ message: JSON.stringify(err.error), duration: 4000 })
          .then(toast => toast.present())
      )
    );
    this.blockingActionService
      .run$(action$)
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}

// Reload the app to force app to re-run the initialization in AppModule.
function reloadApp() {
  location.href = 'index.html';
}
