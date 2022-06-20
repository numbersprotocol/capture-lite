import { Injectable, OnDestroy } from '@angular/core';
import {
  IAPError,
  IAPProduct,
  InAppPurchase2,
} from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  generateMockInAppProducts,
  setupInAppPurchaseDebugPrint,
} from '../../utils/in-app-purchase';
import {
  DiaBackendNumService,
  NumPointPrice,
} from '../dia-backend/num/dia-backend-num.service';
import { ErrorService } from '../error/error.service';

@Injectable({
  providedIn: 'root',
})
export class InAppStoreService implements OnDestroy {
  debugPrint = setupInAppPurchaseDebugPrint('InAppStoreService');

  readonly inAppProducts$ = new BehaviorSubject<IAPProduct[]>([]);
  readonly numPointPricesById$ = new BehaviorSubject<NumPointPricesById>({});

  readonly inAppProductsWithNumpoints$ = combineLatest([
    this.inAppProducts$,
    this.numPointPricesById$,
  ]).pipe(
    map(([inAppProducts, numPointPricesById]) => {
      return inAppProducts.map<InAppProductsWithNumPoint>(inAppProduct => {
        const numPoints = this.numPointsForProduct(
          inAppProduct,
          numPointPricesById
        );
        return { inAppProduct, numPoints };
      });
    })
  );

  private readonly appId = 'io.numbersprotocol.capturelite';

  constructor(
    private readonly store: InAppPurchase2,
    private readonly platform: Platform,
    private readonly errorService: ErrorService,
    private readonly toastController: ToastController,
    private readonly diaBackendNumService: DiaBackendNumService,
    private readonly translocoService: TranslocoService
  ) {}

  async initialize() {
    // Usefull for UI development in WEB environment
    if (!this.isNativePlatform()) {
      this.refreshNumPointsPricing();
      const mockData = generateMockInAppProducts();
      this.inAppProducts$.next(mockData);
      return;
    }

    try {
      await this.platform.ready();
      await this.refreshNumPointsPricing();

      this.regiseterStoreListeners();
      this.registerStoreProducts();

      this.store.refresh();
    } catch (error) {
      const errorMessage = this.translocoService.getTranslation(
        'inAppPurchase.failedToInitInAppStore'
      );
      this.errorService.toastError$(errorMessage).toPromise();
    }
  }

  ngOnDestroy(): void {
    this.unregisterStoreListeners();
  }

  async refreshNumPointsPricing() {
    const result = await this.diaBackendNumService
      .numPointsPriceList$()
      .toPromise();
    const priceListFromRestApi = result.response.price_list;

    const numPointPricesById: NumPointPricesById = {};
    for (const item of priceListFromRestApi) {
      numPointPricesById[item.inAppPurchaseId] = item;
    }

    this.numPointPricesById$.next(numPointPricesById);
  }

  purchase(product: IAPProduct) {
    this.store.order(product);
  }

  private async finishPurchase(inAppProduct: IAPProduct) {
    const pointsToAdd = this.numPointsForProduct(
      inAppProduct,
      this.numPointPricesById$.value
    );

    let receipt;
    if (inAppProduct.transaction?.type === 'ios-appstore') {
      receipt = inAppProduct.transaction.appStoreReceipt;
    }
    if (inAppProduct.transaction?.type === 'android-playstore') {
      receipt = inAppProduct.transaction.receipt;
    }
    if (!receipt) return;

    try {
      await this.diaBackendNumService
        .purchaseNumPoints$(pointsToAdd, receipt)
        .toPromise();
      inAppProduct.finish();

      this.notifyUser(
        this.translocoService.translate('wallets.buyNum.pointsAdded', {
          points: pointsToAdd,
        })
      );
    } catch (error) {
      const errorMessage = this.translocoService.getTranslation(
        'wallets.buyNum.failedToAddPoints'
      );
      this.errorService.toastError$(errorMessage).toPromise();
    }
  }

  private async notifyUser(message: string) {
    return this.toastController
      .create({ message, duration: 700 })
      .then(toast => toast.present());
  }

  private regiseterStoreListeners() {
    this.store.error(this.onStoreError);
    this.store.ready(this.onStoreReady);
    this.store.when('product').approved(this.onStoreProductApproved);
    this.store.when('product').updated(this.onStoreProductUpdated);
    this.store.when('product').verified(this.onStoreProductVerified);
  }

  private unregisterStoreListeners() {
    this.store.off(this.onStoreError);
    this.store.off(this.onStoreReady);
    this.store.off(this.onStoreProductApproved);
    this.store.off(this.onStoreProductUpdated);
    this.store.off(this.onStoreProductVerified);
  }

  private registerStoreProducts() {
    const consumableProductIds = [
      CaptureInAppProductIds.BRONZE_PACK,
      CaptureInAppProductIds.SLIVER_PACK,
      CaptureInAppProductIds.GOLD_PACK,
      CaptureInAppProductIds.PLATINUM_PACK,
    ];
    const type = this.store.CONSUMABLE;

    for (const id of consumableProductIds) {
      this.store.register({ id, type });
    }
  }

  private readonly onStoreError = (_: IAPError) => {
    const errorMessage = this.translocoService.getTranslation(
      'inAppPurchase.inAppPurchaseErrorOcurred'
    );
    this.errorService.toastError$(errorMessage).toPromise();
  };

  private readonly onStoreReady = () => {
    const inAppProducts = this.store.products.filter(
      product => this.shouldIgnoreProduct(product) === false
    );
    this.inAppProducts$.next(inAppProducts);
  };

  private readonly onStoreProductUpdated = (updatedProduct: IAPProduct) => {
    if (this.shouldIgnoreProduct(updatedProduct)) {
      return;
    }

    this.debugPrint('onStoreProductUpdated', updatedProduct);

    const inAppProducts = this.inAppProducts$.value.map(product =>
      product.id === updatedProduct.id ? updatedProduct : product
    );

    this.inAppProducts$.next(inAppProducts);
  };

  private readonly onStoreProductApproved = (product: IAPProduct) => {
    if (this.shouldIgnoreProduct(product)) {
      return;
    }
    this.debugPrint('onStoreProductApproved', product);
    // TODO: in the future add validation logic here
    product.verify();
  };

  private readonly onStoreProductVerified = (product: IAPProduct) => {
    if (this.shouldIgnoreProduct(product)) {
      return;
    }
    this.debugPrint('onStoreProductVerified', product);
    this.finishPurchase(product);
  };

  private shouldIgnoreProduct(product: IAPProduct) {
    // For some reason on iOS there will be 1 in app product
    // with product.id === io.numbersprotocol.capturelite
    // we should ignore that product
    return product.id === this.appId;
  }

  // eslint-disable-next-line class-methods-use-this
  private numPointsForProduct(
    product: IAPProduct,
    numPriceListById: NumPointPricesById
  ) {
    if (product.id in numPriceListById) {
      return numPriceListById[product.id].quantitiy;
    }
    return 0;
  }

  private isNativePlatform() {
    return this.platform.is('hybrid');
  }
}

export enum CaptureInAppProductIds {
  BRONZE_PACK = 'cap_lite_consumable_bronze_pack_099',
  SLIVER_PACK = 'cap_lite_consumable_silver_pack_199',
  GOLD_PACK = 'cap_lite_consumable_gold_pack_299',
  PLATINUM_PACK = 'cap_lite_consumable_platinum_pack_399',
}

interface InAppProductsWithNumPoint {
  inAppProduct: IAPProduct;
  numPoints: number;
}

interface NumPointPricesById {
  [id: string]: NumPointPrice;
}
