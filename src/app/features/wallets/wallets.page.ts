import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, combineLatest, forkJoin } from 'rxjs';
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
  readonly contractAddressNUMBEP20 =
    '0xeceb87cf00dcbf2d4e2880223743ff087a995ad9';
  readonly domainBscScan = 'bscscan.com';

  readonly bscNumBalance$ =
    this.diaBackendWalletService.assetWalletBscNumBalance$;
  readonly points$ = this.diaBackendAuthService.points$;

  readonly totalBalance$ = new BehaviorSubject<number>(0);

  readonly publicKey$ = this.webCryptoApiSignatureProvider.publicKey$;
  readonly privateKey$ = this.webCryptoApiSignatureProvider.privateKey$;
  readonly assetWalletAddr$ = this.diaBackendWalletService.assetWalletAddr$;

  readonly isLoadingBalance$ = new BehaviorSubject<boolean>(false);
  readonly networkConnected$ = this.diaBackendWalletService.networkConnected$;

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
    private readonly router: Router
  ) {
    this.matIconRegistry.addSvgIcon(
      'wallet',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/images/wallet.svg'
      )
    );

    combineLatest([this.bscNumBalance$, this.points$])
      .pipe(
        first(),
        map(
          ([bscNumBalance, points]) => Number(bscNumBalance) + Number(points)
        ),
        untilDestroyed(this)
      )
      .subscribe(totalBalance => this.totalBalance$.next(totalBalance));
  }

  openAssetWalletHistory() {
    this.diaBackendWalletService.assetWalletAddr$
      .pipe(
        first(),
        switchMap(address =>
          Browser.open({
            url: `https://${this.domainBscScan}/token/${this.contractAddressNUMBEP20}?a=${address}`,
            toolbarColor: '#564dfc',
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
