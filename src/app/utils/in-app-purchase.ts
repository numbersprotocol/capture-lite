import { isDevMode } from '@angular/core';
import { IAPProduct } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
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
export function generateMockInAppProducts(): IAPProduct[] {
  const mockInAppProductSample: IAPProduct = {
    id: 'string',
    alias: 'string',
    type: 'string',
    state: 'string',
    title: 'string',
    description: 'string',
    priceMicros: 0,
    price: 'string',
    currency: 'string',
    loaded: true,
    valid: true,
    canPurchase: true,
    owned: true,
    finish: () => ({}),
    verify: () => ({}),
    set: (_: string, __: any) => ({}),
    stateChanged: () => ({}),
    on: (_: string, __: any) => ({}),
    once: (_: string, __: any) => ({}),
    off: (_: any) => ({}),
    trigger: (_: string, __: any) => ({}),
  };

  return [
    {
      ...mockInAppProductSample,
      id: CaptureInAppProductIds.BRONZE_PACK,
      title: 'Bronze Pack',
      price: '0.99',
      currency: 'USD',
      canPurchase: true,
      state: 'valid',
      type: 'CONSUMABLE',
    },
    {
      ...mockInAppProductSample,

      id: CaptureInAppProductIds.SLIVER_PACK,
      title: 'Silver Pack',
      price: '1.99',
      state: 'valid',
      canPurchase: false,
      currency: 'USD',
      type: 'CONSUMABLE',
    },
    {
      ...mockInAppProductSample,
      id: CaptureInAppProductIds.GOLD_PACK,
      title: 'Gold Pack',
      price: '2.99',
      state: 'valid',
      currency: 'USD',
      type: 'CONSUMABLE',
      canPurchase: true,
    },
    {
      ...mockInAppProductSample,
      id: CaptureInAppProductIds.PLATINUM_PACK,
      title: 'Platinum Pack',
      price: '3.99',
      state: 'valid',
      currency: 'USD',
      type: 'CONSUMABLE',
      canPurchase: true,
    },
  ];
}
