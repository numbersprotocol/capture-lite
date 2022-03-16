import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, merge, ObservableInput } from 'rxjs';
import { catchError, finalize, mapTo, startWith, tap } from 'rxjs/operators';
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import { DiaBackendStoreService } from '../../../shared/dia-backend/store/dia-backend-store.service';
import { DiaBackendWalletService } from '../../../shared/dia-backend/wallet/dia-backend-wallet.service';
import { ErrorService } from '../../../shared/error/error.service';
import { TransferLoadingComponent } from './transfer-loading/transfer-loading.component';
import { TransferRequestSentComponent } from './transfer-request-sent/transfer-request-sent.component';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss'],
})
export class TransferPage {
  mode = '';

  readonly assetWalletBscNumBalance$ =
    this.diaBackendWalletService.assetWalletBscNumBalance$;
  readonly integrityWalletBscNumBalance$ =
    this.diaBackendWalletService.integrityWalletBscNumBalance$;

  transferAmount: number | null = null;

  readonly gasFee$ = new BehaviorSubject<number>(0);
  readonly totalCost$ = new BehaviorSubject<number>(0);

  readyToSend = false;

  keyboardIsShown = false;

  private orderId = '';

  readonly keyboardIsHidden$ = merge(
    <ObservableInput<boolean>>this.platform.keyboardDidHide.pipe(mapTo(true)),
    <ObservableInput<boolean>>this.platform.keyboardDidShow.pipe(mapTo(false))
  ).pipe(startWith(true));

  constructor(
    private readonly activeRoute: ActivatedRoute,
    private readonly diaBackendWalletService: DiaBackendWalletService,
    private readonly blockingActionService: BlockingActionService,
    private readonly storeService: DiaBackendStoreService,
    private readonly dialog: MatDialog,
    private readonly navCtrl: NavController,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService,
    private readonly platform: Platform
  ) {
    this.activeRoute.paramMap.subscribe(paramMap => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.mode = paramMap.get('mode')!;
    });
  }

  ionViewWillEnter() {
    this.blockingActionService
      .run$(this.diaBackendWalletService.syncIntegrityAndAssetWalletBalance$())
      .pipe(
        catchError(() =>
          this.errorService.toastError$(
            this.translocoService.translate(
              `error.wallets.cannotRefreshBalance`
            )
          )
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  onInputTransferAmount() {
    this.readyToSend = false;
  }

  calculateGasFee() {
    if (!this.transferAmount) {
      this.errorService
        .toastError$(
          this.translocoService.translate('error.wallets.emptyTransferAmount')
        )
        .pipe(untilDestroyed(this))
        .subscribe();
      return;
    }

    const networkApp =
      this.mode == 'withdraw'
        ? 'CustodialWalletWithdraw'
        : 'CustodialWalletDeposit';

    this.blockingActionService
      .run$(
        this.storeService.createNetworkAppOrder(
          networkApp,
          {},
          this.transferAmount
        )
      )
      .pipe(
        tap(networkAppOrder => {
          this.orderId = networkAppOrder.id;
          this.gasFee$.next(Number(networkAppOrder.fee));
          this.totalCost$.next(
            Number(networkAppOrder.fee) + Number(this.transferAmount)
          );
          this.readyToSend = true;
        }),
        catchError((err: unknown) => {
          if (err instanceof HttpErrorResponse) {
            const errorType = err.error.error?.type;
            // Handle `insufficient_fund` as a special case here to extract how much
            // NUM is needed and display that to the user.
            if (errorType === 'insufficient_fund') {
              const errorDetails = err.error.error?.details;
              const decimalPlaces = 2;
              try {
                return this.errorService.toastError$(
                  this.translocoService.translate(
                    `error.wallets.insufficientFundWithRequiredBalance`,
                    {
                      requiredBalance: Number(
                        errorDetails.split(':')[1].trim()
                      ).toFixed(decimalPlaces),
                    }
                  )
                );
              } catch (_) {
                return this.errorService.toastError$(
                  this.translocoService.translate(
                    `error.diaBackend.${errorType}`
                  )
                );
              }
            }
          }
          return this.errorService.toastDiaBackendError$(err);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  transfer() {
    const dialogRef = this.dialog.open<TransferLoadingComponent>(
      TransferLoadingComponent,
      {
        minWidth: '90%',
        disableClose: true,
        data: this.mode,
        panelClass: 'num-transfer-dialog',
      }
    );

    this.storeService
      .confirmNetworkAppOrder(this.orderId)
      .pipe(
        tap(() => this.openTransferRequestSentDialog()),
        catchError((err: unknown) =>
          this.errorService.toastDiaBackendError$(err)
        ),
        finalize(() => dialogRef.close()),
        untilDestroyed(this)
      )
      .subscribe();
  }

  openTransferRequestSentDialog() {
    const dialogRef = this.dialog.open<TransferRequestSentComponent>(
      TransferRequestSentComponent,
      {
        minWidth: '90%',
        disableClose: true,
        data: this.mode,
        panelClass: 'num-transfer-dialog',
      }
    );
    dialogRef
      .afterClosed()
      .toPromise()
      .then(() => this.navCtrl.navigateBack('/wallets'));
  }
}
