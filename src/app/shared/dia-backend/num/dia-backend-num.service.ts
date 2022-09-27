import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL, BUBBLE_IFRAME_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendNumService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  purchaseNumPoints$(pointsToAdd: number, receiptId: string) {
    return defer(() => this.authService.getAuthHeadersWithApiKey()).pipe(
      concatMap(headers => {
        const formData = new FormData();
        formData.set('points', pointsToAdd.toString());
        formData.set('receipt_id', receiptId);
        return this.httpClient.post<DiaBackendNumPointPurchaseResult>(
          `${BASE_URL}/api/v3/num/points/purchase/`,
          formData,
          { headers }
        );
      })
    );
  }

  numPointsPriceList$() {
    // ask @ethan wu to change bubble endpoint from POST to GET
    return defer(() =>
      this.httpClient.post<NumPointPriceListResponse>(
        `${BUBBLE_IFRAME_URL}/api/1.1/wf/get_num_price`,
        {}
      )
    );
  }
}

export interface DiaBackendNumPointPurchaseResult {
  id: string;
  user: string;
  type:
    | 'airdrop'
    | 'purchase'
    | 'user_reward'
    | 'order'
    | 'network_app_order'
    | 'existing';
  event_identifier: string;
  receipt_id: string;
  points: string;
  spent: string;
  created_at: string;
  expired_at: string;
}

export interface NumPointPrice {
  id: number;
  inAppPurchaseId: string;
  // ask @ethan wu to fix type in rest api
  quantitiy: number;
}

export interface NumPointPriceListResponse {
  status: 'success' | string;
  response: {
    price_list: NumPointPrice[];
  };
}
