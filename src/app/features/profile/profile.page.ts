import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer } from 'rxjs';
import { catchError, concatMapTo } from 'rxjs/operators';
import { BlockingActionService } from '../../shared/services/blocking-action/blocking-action.service';
import { WebCryptoApiSignatureProvider } from '../../shared/services/collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { DiaBackendAuthService } from '../../shared/services/dia-backend/auth/dia-backend-auth.service';

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
    private readonly router: Router,
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
      concatMapTo(defer(() => this.router.navigate(['/login']))),
      catchError(err =>
        this.toastController
          .create({ message: JSON.stringify(err.error), duration: 4000 })
          .then(toast => toast.present())
      )
    );
    this.blockingActionService
      .run$(action$, {
        message: this.translocoService.translate('talkingToTheServer'),
      })
      .pipe(untilDestroyed(this))
      .subscribe();
  }
}
