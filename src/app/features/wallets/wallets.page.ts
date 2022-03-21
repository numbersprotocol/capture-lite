import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { concatMap, first, map, switchMap } from 'rxjs/operators';
import { WebCryptoApiSignatureProvider } from '../../shared/collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { ConfirmAlert } from '../../shared/confirm-alert/confirm-alert.service';
import { DiaBackendWalletService } from '../../shared/dia-backend/wallet/dia-backend-wallet.service';
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
  readonly points = 0;

  readonly totalBalance$ = this.bscNumBalance$.pipe(
    map(num => num + this.points)
  );

  readonly publicKey$ = this.webCryptoApiSignatureProvider.publicKey$;
  readonly privateKey$ = this.webCryptoApiSignatureProvider.privateKey$;
  readonly assetWalletAddr$ = this.diaBackendWalletService.assetWalletAddr$;

  readonly isLoadingBalance$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly diaBackendWalletService: DiaBackendWalletService,
    private readonly matIconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer,
    private readonly snackBar: MatSnackBar,
    private readonly translocoService: TranslocoService,
    private readonly webCryptoApiSignatureProvider: WebCryptoApiSignatureProvider,
    private readonly confirmAlert: ConfirmAlert,
    private readonly dialog: MatDialog
  ) {
    this.matIconRegistry.addSvgIcon(
      'wallet',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/images/wallet.svg'
      )
    );
  }

  openNUMTransactionHistory() {
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

  async refreshBalance(event: Event) {
    (<CustomEvent>event).detail.complete();
    this.isLoadingBalance$.next(true);
    await this.diaBackendWalletService.syncAssetWalletBalance$().toPromise();
    this.isLoadingBalance$.next(false);
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
