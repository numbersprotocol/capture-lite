import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Clipboard } from '@capacitor/clipboard';
import { NavController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgxQrcodeElementTypes } from '@techiediaries/ngx-qrcode';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { concatMap, first, map, tap } from 'rxjs/operators';
import { CaptureAppWebCryptoApiSignatureProvider } from '../../shared/collector/signature/capture-app-web-crypto-api-signature-provider/capture-app-web-crypto-api-signature-provider.service';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../shared/dia-backend/secret';
import { DiaBackendWalletService } from '../../shared/dia-backend/wallet/dia-backend-wallet.service';
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.page.html',
  styleUrls: ['./wallets.page.scss'],
})
export class WalletsPage {
  readonly publicKey$ = this.capAppWebCryptoApiSignatureProvider.publicKey$;
  readonly privateKey$ = this.capAppWebCryptoApiSignatureProvider.privateKey$;
  readonly assetWalletAddr$ = this.diaBackendWalletService.assetWalletAddr$;

  readonly networkConnected$ = this.diaBackendWalletService.networkConnected$;

  readonly iframeUrl$ = this.diaBackendAuthService.cachedQueryJWTToken$.pipe(
    map(token => {
      const queryParams = `token=${token.access}&refresh_token=${token.refresh}`;
      const url = `${BUBBLE_IFRAME_URL}/wallet?${queryParams}`;
      return url;
    })
  );
  readonly iframeLoaded$ = new BehaviorSubject(false);

  elementType = NgxQrcodeElementTypes.URL;
  shouldHideDepositButton = false;

  constructor(
    private readonly diaBackendWalletService: DiaBackendWalletService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly snackBar: MatSnackBar,
    private readonly translocoService: TranslocoService,
    private readonly capAppWebCryptoApiSignatureProvider: CaptureAppWebCryptoApiSignatureProvider,
    private readonly router: Router,
    private readonly navController: NavController
  ) {}

  ionViewDidEnter() {
    this.processIframeEvents();
  }

  private processIframeEvents() {
    fromEvent(window, 'message')
      .pipe(
        tap(event => {
          const postMessageEvent = event as MessageEvent;
          switch (postMessageEvent.data) {
            case 'iframe-on-load':
              this.iframeLoaded$.next(true);
              break;
            case 'iframeBackButtonClicked':
              this.navController.pop();
              break;
            case 'iframe-buy-num-button-clicked':
              this.navigateToBuyNumPage();
              break;
            case 'iframe-copy-to-clipboard-asset-wallet':
              this.copyToClipboardAssetWallet();
              break;
            case 'iframe-copy-to-clipboard-integrity-wallet':
              this.copyToClipboardIntegrityWallet();
              break;
            case 'iframe-copy-to-clipboard-private-key':
              this.copyToClipboardPrivateKey();
              break;
            default:
              break;
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private copyToClipboardAssetWallet() {
    this.assetWalletAddr$
      .pipe(
        first(),
        concatMap(assetWalletAddr => this.copyToClipboard(assetWalletAddr)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private copyToClipboardIntegrityWallet() {
    this.publicKey$
      .pipe(
        first(),
        concatMap(publicKey => this.copyToClipboard(publicKey)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private copyToClipboardPrivateKey() {
    this.privateKey$
      .pipe(
        first(),
        concatMap(privateKey => this.copyToClipboard(privateKey)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  navigateToBuyNumPage() {
    this.router.navigate(['wallets', 'buy-num']);
  }

  async copyToClipboard(value: string) {
    await Clipboard.write({ string: value });
    this.snackBar.open(
      this.translocoService.translate('message.copiedToClipboard')
    );
  }
}
