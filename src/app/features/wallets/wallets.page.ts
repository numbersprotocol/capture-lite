import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import { NavController, Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgxQrcodeElementTypes } from '@techiediaries/ngx-qrcode';
import { BehaviorSubject, combineLatest, forkJoin, fromEvent } from 'rxjs';
import {
  catchError,
  concatMap,
  finalize,
  first,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { WebCryptoApiSignatureProvider } from '../../shared/collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { ConfirmAlert } from '../../shared/confirm-alert/confirm-alert.service';
import { DiaBackendAuthService } from '../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../shared/dia-backend/secret';
import { DiaBackendWalletService } from '../../shared/dia-backend/wallet/dia-backend-wallet.service';
import { ErrorService } from '../../shared/error/error.service';
import { ExportPrivateKeyModalComponent } from '../../shared/export-private-key-modal/export-private-key-modal.component';
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.page.html',
  styleUrls: ['./wallets.page.scss'],
})
export class WalletsPage {
  readonly domainMainnetNum = 'mainnet.num.network';

  readonly mainNumBalance$ =
    this.diaBackendWalletService.assetWalletMainnetNumBalance$;
  readonly points$ = this.diaBackendAuthService.points$;

  readonly totalBalance$ = new BehaviorSubject<number>(0);

  readonly publicKey$ = this.webCryptoApiSignatureProvider.publicKey$;
  readonly privateKey$ = this.webCryptoApiSignatureProvider.privateKey$;
  readonly assetWalletAddr$ = this.diaBackendWalletService.assetWalletAddr$;

  readonly isLoadingBalance$ = new BehaviorSubject<boolean>(false);
  readonly networkConnected$ = this.diaBackendWalletService.networkConnected$;

  readonly iframeUrl$ = this.diaBackendAuthService.cachedQueryJWTToken$.pipe(
    map(token => {
      const queryParams = `token=${token.access}&refresh_token=${token.refresh}`;
      const url = `${BUBBLE_IFRAME_URL}/version-v230116-ethan/wallet?${queryParams}`;
      return url;
    })
  );
  readonly iframeLoaded$ = new BehaviorSubject(false);

  elementType = NgxQrcodeElementTypes.URL;
  shouldHideDepositButton = false;

  constructor(
    private readonly diaBackendWalletService: DiaBackendWalletService,
    private readonly diaBackendAuthService: DiaBackendAuthService,
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer,
    private readonly snackBar: MatSnackBar,
    private readonly translocoService: TranslocoService,
    private readonly webCryptoApiSignatureProvider: WebCryptoApiSignatureProvider,
    private readonly confirmAlert: ConfirmAlert,
    private readonly dialog: MatDialog,
    private readonly errorService: ErrorService,
    private readonly router: Router,
    private readonly platform: Platform,
    private readonly navController: NavController
  ) {
    this.matIconRegistry.addSvgIcon(
      'wallet',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/images/wallet.svg'
      )
    );

    combineLatest([this.mainNumBalance$, this.points$])
      .pipe(
        first(),
        map(
          ([mainNumBalance, points]) => Number(mainNumBalance) + Number(points)
        ),
        untilDestroyed(this)
      )
      .subscribe(totalBalance => this.totalBalance$.next(totalBalance));

    this.shouldHideDepositButton = this.platform.is('ios');
  }

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

  // eslint-disable-next-line class-methods-use-this
  onBuyNumBtnClicked() {
    Browser.open({
      url: `https://link.numbersprotocol.io/buy-num`,
      toolbarColor: '#564dfc',
    });
  }

  navigateToBuyNumPage() {
    this.router.navigate(['wallets', 'buy-num']);
  }

  openAssetWalletHistory() {
    this.diaBackendWalletService.assetWalletAddr$
      .pipe(
        first(),
        switchMap(address =>
          Browser.open({
            url: `https://${this.domainMainnetNum}/address/${address}`,
            toolbarColor: '#000000',
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  refreshBalance(event: Event) {
    (<CustomEvent>event).detail.complete();
    this.networkConnected$
      .pipe(
        first(),
        concatMap(networkConnected => {
          if (!networkConnected) {
            return this.errorService.toastError$(
              this.translocoService.translate(
                `error.wallets.noNetworkConnectionCannotRefreshBalance`
              )
            );
          }
          this.isLoadingBalance$.next(true);
          return forkJoin([
            this.diaBackendWalletService.syncAssetWalletBalance$(),
            this.diaBackendAuthService.syncProfile$(),
          ]).pipe(
            tap(async ([assetWallet, _]) => {
              this.totalBalance$.next(
                Number(assetWallet[1]) +
                  (await this.diaBackendAuthService.getPoints())
              );
            }),
            catchError(() =>
              this.errorService.toastError$(
                this.translocoService.translate(
                  `error.wallets.cannotRefreshBalance`
                )
              )
            ),
            finalize(() => this.isLoadingBalance$.next(false))
          );
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async onDepositWithdrawBtnClick(mode: 'deposit' | 'withdraw') {
    this.networkConnected$
      .pipe(
        first(),
        concatMap(networkConnected => {
          if (!networkConnected) {
            return this.errorService.toastError$(
              this.translocoService.translate(`error.internetError`)
            );
          }
          return this.router.navigate(['wallets', 'transfer', mode]);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async copyToClipboard(value: string) {
    await Clipboard.write({ string: value });
    this.snackBar.open(
      this.translocoService.translate('message.copiedToClipboard')
    );
  }

  exportIntegrityWalletPrivateKey() {
    this.privateKey$
      .pipe(
        first(),
        concatMap(async privateKey => {
          const result = await this.confirmAlert.present({
            message: this.translocoService.translate(
              'message.confirmCopyPrivateKey'
            ),
          });
          if (result)
            this.dialog.open<ExportPrivateKeyModalComponent>(
              ExportPrivateKeyModalComponent,
              {
                data: { privateKey },
              }
            );
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
