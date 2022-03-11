import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  BehaviorSubject,
  combineLatest,
  merge,
  ObservableInput,
  of,
} from 'rxjs';
import {
  catchError,
  concatMap,
  first,
  mapTo,
  startWith,
  tap,
} from 'rxjs/operators';
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
      if (!paramMap.has('mode')) {
        this.navCtrl.navigateBack('/wallets');
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.mode = paramMap.get('mode')!;
    });
  }

  ionViewWillEnter() {
    this.blockingActionService
      .run$(this.diaBackendWalletService.syncIntegrityAndAssetWalletBalance$())
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  onInputTransferAmount() {
    this.readyToSend = false;
  }

  hasSufficientBalance$() {
    return combineLatest([
      this.assetWalletBscNumBalance$,
      this.integrityWalletBscNumBalance$,
      this.totalCost$,
    ]).pipe(
      first(),
      concatMap(
        ([assetWalletBscNumBalance, integrityWalletBscNum, totalCost]) => {
          if (
            (this.mode === 'withdraw' &&
              totalCost > assetWalletBscNumBalance) ||
            (this.mode === 'deposit' && totalCost > integrityWalletBscNum)
          ) {
            throw new Error(
              this.translocoService.translate('error.wallets.insufficientFund')
            );
          }
          return of(true);
        }
      )
    );
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

    this.hasSufficientBalance$()
      .pipe(
        concatMap(() => this.storeService.confirmNetworkAppOrder(this.orderId)),
        tap(() => dialogRef.close()),
        tap(() => this.openTransferRequestSentDialog()),
        catchError((err: unknown) => {
          dialogRef.close();
          if (err instanceof HttpErrorResponse) {
            const errorType = err.error.error?.type;
            if (
              errorType === 'insufficient_fund' ||
              errorType === 'order_expired'
            )
              return this.errorService.toastError$(
                this.translocoService.translate(`error.diaBackend.${errorType}`)
              );
          }
          return this.errorService.toastError$(err);
        }),
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
