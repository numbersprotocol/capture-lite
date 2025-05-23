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
import { BubbleToIonicPostMessage } from '../../shared/iframe/iframe';
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
  private reload = false;

  constructor(
    private readonly diaBackendWalletService: DiaBackendWalletService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly snackBar: MatSnackBar,
    private readonly translocoService: TranslocoService,
    private readonly capAppWebCryptoApiSignatureProvider: CaptureAppWebCryptoApiSignatureProvider,
    private readonly router: Router,
    private readonly navController: NavController
  ) {
    this.processIframeEvents();
    this.reloadPage();
  }

  ionViewWillEnter() {
    if (this.reload) {
      this.reload = false;
      this.navController.back({ animated: false });
    }
  }

  private processIframeEvents() {
    fromEvent(window, 'message')
      .pipe(
        tap(event => {
          const postMessageEvent = event as MessageEvent;
          const data = postMessageEvent.data as BubbleToIonicPostMessage;
          switch (data) {
            case BubbleToIonicPostMessage.IFRAME_ON_LOAD:
              this.iframeLoaded$.next(true);
              break;
            case BubbleToIonicPostMessage.IFRAME_BACK_BUTTON_CLICKED:
              this.navController.back();
              break;
            case BubbleToIonicPostMessage.IFRAME_BUY_NUM_BUTTON_CLICKED:
              this.navigateToBuyNumPage();
              break;
            case BubbleToIonicPostMessage.IFRAME_COPY_TO_CLIPBOARD_ASSET_WALLET:
              this.copyToClipboardAssetWallet();
              break;
            case BubbleToIonicPostMessage.IFRAME_COPY_TO_CLIPBOARD_INTEGRITY_WALLET:
              this.copyToClipboardIntegrityWallet();
              break;
            case BubbleToIonicPostMessage.IFRAME_COPY_TO_CLIPBOARD_PRIVATE_KEY:
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

  private reloadPage() {
    this.diaBackendWalletService.reloadWallet$
      .pipe(
        tap(reload => {
          if (reload) {
            this.reload = true;
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
