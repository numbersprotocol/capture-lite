import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IAPProduct } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { AlertController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { map, tap } from 'rxjs/operators';
import { InAppStoreService } from '../../../shared/in-app-store/in-app-store.service';

@Component({
  selector: 'app-buy-num',
  templateUrl: './buy-num.page.html',
  styleUrls: ['./buy-num.page.scss'],
})
export class BuyNumPage implements OnInit {
  readonly tmpIcon = '../../../../assets/images/num-icon.svg';

  readonly inAppProducts$ = this.store.inAppProductsWithNumpoints$.pipe(
    tap(_ => this.ref.detectChanges())
  );

  readonly totalProducts$ = this.store.inAppProductsWithNumpoints$.pipe(
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

  purchase(product: IAPProduct) {
    this.store.purchase(product);
  }

  async showNumPointsQuantity(numPoints: number) {
    const info = this.translocoService.translate(
      'wallets.buyNum.thisPackageIncludesXNumPoints',
      { points: numPoints }
    );
    const okText = this.translocoService.translate('wallets.buyNum.okIGotIt');
    const alert = await this.alertController.create({
      header: info,
      buttons: [okText],
    });
    await alert.present();
  }
}
