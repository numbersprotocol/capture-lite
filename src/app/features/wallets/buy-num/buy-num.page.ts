import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { InAppStoreService } from '../../../shared/in-app-store/in-app-store.service';

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

  constructor(
    private readonly store: InAppStoreService,
    private readonly ref: ChangeDetectorRef,
    private readonly alertController: AlertController,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit() {
    this.store.refreshNumPointsPricing();
  }

  purchase(product: CdvPurchase.Product) {
    this.store.purchase(product);
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
