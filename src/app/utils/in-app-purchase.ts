import { isDevMode } from '@angular/core';
import { CaptureInAppProductIds } from '../shared/in-app-store/in-app-store.service';

export function truncateReceipt(recipt: string) {
  const preferredMaxLength = 1024;
  const receiptMaxLength = Math.min(recipt.length, preferredMaxLength);
  return recipt.substring(0, receiptMaxLength);
}

/**
 * Usefull to see in app product state changes in console for better debugging.
 * It will pring to console only in dev mode aka isDevMode() === true
 */
export function setupInAppPurchaseDebugPrint(tag: string) {
  return function (message: string, data?: any) {
    if (!isDevMode()) return;

    // eslint-disable-next-line no-console
    console.log(`${tag}: ${message}`);

    if (data) {
      const tabIndent = 4;
      // eslint-disable-next-line no-console
      console.log(`${JSON.stringify(data, null, tabIndent)}`);
    }
  };
}

/**
 * Usefull during UI development in Web environment. In App purchase plugin
 * does not work in Web environment therefore we can use this util function
 * to pupulate with mock product to develop UI with different product states
 */
export function generateMockInAppProducts(): CdvPurchase.Product[] {
  const mockInAppProductSample: CdvPurchase.Product = {
    id: 'string',
    className: 'Product',
    platform: CdvPurchase.Platform.TEST,
    offers: [],
    pricing: undefined,
    type: CdvPurchase.ProductType.CONSUMABLE,
    title: 'string',
    description: 'string',
    canPurchase: true,
    owned: true,
    getOffer: () => undefined,
    addOffer: () => ({} as CdvPurchase.Product),
  };

  return [
    {
      ...mockInAppProductSample,
      id: CaptureInAppProductIds.BRONZE_PACK,
      title: '100 NumPoints',
      description: '100 NumPoints',
      pricing: undefined,
      canPurchase: true,
      owned: true,
      getOffer: () => undefined,
      addOffer: () => ({} as CdvPurchase.Product),
    },
    {
      ...mockInAppProductSample,
      id: CaptureInAppProductIds.SLIVER_PACK,
      title: '500 NumPoints',
      description: '500 NumPoints',
      pricing: undefined,
      canPurchase: true,
      owned: true,
      getOffer: () => undefined,
      addOffer: () => ({} as CdvPurchase.Product),
    },
    {
      ...mockInAppProductSample,
      id: CaptureInAppProductIds.GOLD_PACK,
      title: '1000 NumPoints',
      description: '1000 NumPoints',
      pricing: undefined,
      canPurchase: true,
      owned: true,
      getOffer: () => undefined,
      addOffer: () => ({} as CdvPurchase.Product),
    },
    {
      ...mockInAppProductSample,
      id: CaptureInAppProductIds.PLATINUM_PACK,
      title: '5000 NumPoints',
      description: '5000 NumPoints',
      pricing: undefined,
      canPurchase: true,
      owned: true,
      getOffer: () => undefined,
      addOffer: () => ({} as CdvPurchase.Product),
    },
  ];
}
