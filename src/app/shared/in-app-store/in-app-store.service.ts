import { Injectable, OnDestroy } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import 'cordova-plugin-purchase';
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

  readonly inAppProducts$ = new BehaviorSubject<CdvPurchase.Product[]>([]);
  readonly numPointPricesById$ = new BehaviorSubject<NumPointPricesById>({});

  private store!: CdvPurchase.Store;

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
    private readonly platform: Platform,
    private readonly errorService: ErrorService,
    private readonly toastController: ToastController,
    private readonly diaBackendNumService: DiaBackendNumService,
    private readonly translocoService: TranslocoService
  ) {}

  async initialize() {
    // Usefull for UI development in WEB environment
    if (!this.isNativePlatform()) {
      const mockData = generateMockInAppProducts();
      this.inAppProducts$.next(mockData);
      return;
    }

    try {
      await this.platform.ready();

      this.store = CdvPurchase.store;

      this.regiseterStoreListeners();
      this.registerStoreProducts();
    } catch (error) {
      const errorMessage = this.translocoService.translate(
        'inAppPurchase.failedToInitInAppStore'
      );
      this.errorService.toastError$(errorMessage).toPromise();
    }
  }

  ngOnDestroy(): void {
    this.unregisterStoreListeners();
  }

  async refreshNumPointsPricing() {
    try {
      const result = await this.diaBackendNumService
        .numPointsPriceList$()
        .toPromise();
      const priceListFromRestApi = result.response.price_list;

      const numPointPricesById: NumPointPricesById = {};
      for (const item of priceListFromRestApi) {
        numPointPricesById[item.inAppPurchaseId] = item;
      }

      this.numPointPricesById$.next(numPointPricesById);
    } catch (_) {
      this.numPointPricesById$.next({});
    }
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
        this.translocoService.translate('wallets.buyCredits.xCreditsAdded', {
          credits: pointsToAdd,
        })
      );
    } catch (error) {
      const errorMessage = this.translocoService.translate(
        'wallets.buyCredits.failedToAddCredits'
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
    this.store.when().approved(this.onStoreProductApproved);
    this.store.when().productUpdated(this.onStoreProductUpdated);
    this.store.when().verified(this.onStoreProductVerified);
  }

  private unregisterStoreListeners() {
    this.store.off(this.onStoreError);
    this.store.off(this.onStoreReady);
    this.store.off(this.onStoreProductApproved);
    this.store.off(this.onStoreProductUpdated);
    this.store.off(this.onStoreProductVerified);
  }

  private registerStoreProducts() {
    const consumableProductIds = Object.values(CaptureInAppProductIds);
    const type = CdvPurchase.ProductType.CONSUMABLE;
    const appstorePlatform = CdvPurchase.Platform.APPLE_APPSTORE;
    const googlePlayPlatform = CdvPurchase.Platform.GOOGLE_PLAY;

    const productsToRegister: CdvPurchase.IRegisterProduct[] = [];
    for (const id of consumableProductIds) {
      productsToRegister.push({ id, type, platform: appstorePlatform });
      productsToRegister.push({ id, type, platform: googlePlayPlatform });
    }

    this.store.register(productsToRegister);
  }

  private readonly onStoreError = (_: CdvPurchase.IError) => {
    const errorMessage = this.translocoService.translate(
      'inAppPurchase.inAppPurchaseErrorOcurred'
    );
    this.errorService.toastError$(errorMessage).toPromise();
    // TODO: report to remote error service
  };

  private readonly onStoreReady = () => {
    const inAppProducts = this.store.products.filter(
      product => this.shouldIgnoreProduct(product) === false
    );
    this.inAppProducts$.next(inAppProducts);
  };

  private readonly onStoreProductUpdated = (
    updatedProduct: CdvPurchase.Product
  ) => {
    if (this.shouldIgnoreProduct(updatedProduct)) {
      return;
    }

    this.debugPrint('onStoreProductUpdated', updatedProduct);

    this.inAppProducts$.next(this.store.products);
  };

  private readonly onStoreProductApproved = (
    transacction: CdvPurchase.Transaction
  ) => {
    this.debugPrint('onStoreProductApproved', transacction);
    transacction.verify();
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
    product: CdvPurchase.Product,
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
  BRONZE_PACK = 'capture_lite_consumable_bronze_pack_099',
  SLIVER_PACK = 'capture_lite_consumable_silver_pack_199',
  GOLD_PACK = 'capture_lite_consumable_gold_pack_299',
  PLATINUM_PACK = 'capture_lite_consumable_platinum_pack_399',
}

interface InAppProductsWithNumPoint {
  inAppProduct: CdvPurchase.Product;
  numPoints: number;
}

interface NumPointPricesById {
  [id: string]: NumPointPrice;
}
