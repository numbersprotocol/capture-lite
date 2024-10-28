import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { filter, first, map, tap } from 'rxjs/operators';
import { BlockingActionService } from '../../../shared/blocking-action/blocking-action.service';
import { DiaBackendWalletService } from '../../../shared/dia-backend/wallet/dia-backend-wallet.service';
import { InAppStoreService } from '../../../shared/in-app-store/in-app-store.service';

@UntilDestroy()
@Component({
  selector: 'app-buy-num',
  templateUrl: './buy-num.page.html',
  styleUrls: ['./buy-num.page.scss'],
})
export class BuyNumPage implements OnInit {
  readonly tmpIcon = '../../../../assets/images/num-icon.svg';

  readonly inAppProducts$ = combineLatest([
    this.store.inAppProductsWithNumpoints$,
    this.store.numPointPricesById$,
  ]).pipe(
    map(([inAppProductsWithNumpoints, numPointPricesById]) => {
      const totalProducts = inAppProductsWithNumpoints.length;
      const totalPrices = Object.keys(numPointPricesById).length;
      if (totalProducts === 0 || totalPrices === 0) {
        return [];
      }
      return inAppProductsWithNumpoints;
    }),
    tap(_ => this.ref.detectChanges())
  );

  readonly totalProducts$ = this.inAppProducts$.pipe(
    map(products => products.length),
    tap(_ => this.ref.detectChanges())
  );

  readonly isProcessingOrder$ = this.store.isProcessingOrder$;

  constructor(
    private readonly store: InAppStoreService,
    private readonly ref: ChangeDetectorRef,
    private readonly alertController: AlertController,
    private readonly translocoService: TranslocoService,
    private readonly blockingActionService: BlockingActionService,
    private readonly diaBackendWalletService: DiaBackendWalletService
  ) {}

  ngOnInit() {
    this.store.refreshNumPointsPricing();
  }

  purchase(product: CdvPurchase.Product) {
    this.diaBackendWalletService.reloadWallet$.next(true);
    this.showLoadingIndicatorUntillOrderIsProcessed();
    this.store.purchase(product);
  }

  private showLoadingIndicatorUntillOrderIsProcessed() {
    const action$ = this.isProcessingOrder$.pipe(
      filter(isProcessing => isProcessing === false),
      first()
    );
    this.blockingActionService.run$(action$).subscribe();
  }

  async showNumPointsQuantity(numPoints: number) {
    const info = this.translocoService.translate(
      'wallets.buyCredits.thisPackageIncludeXCredits',
      { credits: numPoints }
    );
    const okText = this.translocoService.translate(
      'wallets.buyCredits.okIGotIt'
    );
    const alert = await this.alertController.create({
      header: info,
      buttons: [okText],
    });
    await alert.present();
  }
}
