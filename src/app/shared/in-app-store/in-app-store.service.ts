import { HttpErrorResponse } from '@angular/common/http';
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
          inAppProduct.id,
          numPointPricesById
        );
        return { inAppProduct, numPoints };
      });
    })
  );

  readonly isProcessingOrder$ = new BehaviorSubject<boolean>(false);

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
      this.store.initialize();
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

  purchase(product: CdvPurchase.Product) {
    const offer = product.getOffer();
    if (!offer) return;
    this.isProcessingOrder$.next(true);
    this.store.order(offer);
  }

  private async finishPurchase(receipt: CdvPurchase.VerifiedReceipt) {
    const product = this.extractProductFromReceipt(receipt);
    if (!product) {
      receipt.finish();
      this.isProcessingOrder$.next(false);
      return;
    }

    const storeReceipt = this.extractStoreReceipt(receipt);
    if (!storeReceipt) {
      receipt.finish();
      this.isProcessingOrder$.next(false);
      return;
    }

    try {
      const pointsToAdd = this.numPointsForProduct(
        product.id,
        this.numPointPricesById$.value
      );

      await this.diaBackendNumService
        .purchaseNumPoints$(pointsToAdd, storeReceipt)
        .toPromise();

      receipt.finish();
      this.isProcessingOrder$.next(false);

      this.notifyUser(
        this.translocoService.translate('wallets.buyCredits.xCreditsAdded', {
          credits: pointsToAdd,
        })
      );
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        error.error.error?.type === 'duplicate_receipt_id'
      ) {
        /**
         * The receipt has already been used to get NUM points.
         *
         * In case of duplicate receipt id, the user has already received the points
         * and we can ignore the error. Duplicate receipt can happen if callbacks
         * registered in CdvPurchase is called twice. Issue is more related to plugin itslef:
         * https://github.com/j3k0/cordova-plugin-purchase/issues/1458
         *
         * Thanks to our backend implementation, the user will not be given NUMs twice.
         * In this case we just finish the receipt and make sure loading indicator is hidden.
         */
        receipt.finish();
        this.isProcessingOrder$.next(false);
      } else {
        this.errorService
          .toastError$(
            this.translocoService.translate(
              'wallets.buyCredits.failedToAddCredits'
            )
          )
          .toPromise();
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private extractProductFromReceipt(receipt: CdvPurchase.VerifiedReceipt) {
    for (const transaction of receipt.sourceReceipt.transactions) {
      for (const product of transaction.products) {
        const isIncluded = Object.values<string>(
          CaptureInAppProductIds
        ).includes(product.id);
        if (isIncluded) return product;
      }
    }
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  private extractStoreReceipt(
    receipt: CdvPurchase.VerifiedReceipt
  ): string | undefined {
    const platform = receipt.sourceReceipt.platform;

    if (platform === CdvPurchase.Platform.APPLE_APPSTORE) {
      // nativeData is not documented, but it is there (can be veified by console.log(receipt))
      return (receipt.sourceReceipt as any).nativeData.appStoreReceipt;
    }

    if (platform === CdvPurchase.Platform.GOOGLE_PLAY) {
      // nativePurchase is not documented, but it is there (can be veified by console.log(receipt))
      return (receipt.sourceReceipt.transactions[0] as any).nativePurchase
        .receipt;
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

  private readonly onStoreError = (error: CdvPurchase.IError) => {
    this.isProcessingOrder$.next(false);

    if (
      error.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED ||
      error.message === 'The user cancelled the order.'
    )
      return;

    const errorMessage = this.translocoService.translate(
      'inAppPurchase.inAppPurchaseErrorOcurred'
    );
    this.errorService.toastError$(errorMessage).toPromise();
    // TODO: report to remote error service
  };

  private readonly onStoreReady = () => {
    this.inAppProducts$.next(this.store.products);
  };

  private readonly onStoreProductUpdated = (
    updatedProduct: CdvPurchase.Product
  ) => {
    this.debugPrint('onStoreProductUpdated', updatedProduct);
    this.inAppProducts$.next(this.store.products);
  };

  private readonly onStoreProductApproved = (
    transacction: CdvPurchase.Transaction
  ) => {
    this.debugPrint('onStoreProductApproved', transacction);
    transacction.verify();
  };

  private readonly onStoreProductVerified = (
    receipt: CdvPurchase.VerifiedReceipt
  ) => {
    this.debugPrint('onStoreProductVerified', receipt);
    this.finishPurchase(receipt);
  };

  // eslint-disable-next-line class-methods-use-this
  private numPointsForProduct(
    productId: string,
    numPriceListById: NumPointPricesById
  ) {
    if (productId in numPriceListById) {
      return numPriceListById[productId].quantitiy;
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
