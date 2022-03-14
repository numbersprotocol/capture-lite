import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendStoreService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  createNetworkAppOrder(networkApp: string, actionArgs: any, price = 0) {
    return defer(() => this.authService.getAuthHeadersWithApiKey()).pipe(
      concatMap(headers => {
        return this.httpClient.post<NetworkAppOrder>(
          `${BASE_URL}/api/v3/store/network-app-orders/`,
          {
            network_app: networkApp,
            price: price,
            action_args: actionArgs,
          },
          { headers }
        );
      })
    );
  }

  confirmNetworkAppOrder(id: string) {
    return defer(() => this.authService.getAuthHeadersWithApiKey()).pipe(
      concatMap(headers => {
        return this.httpClient.post<NetworkAppOrder>(
          `${BASE_URL}/api/v3/store/network-app-orders/${id}/confirm/`,
          {},
          { headers }
        );
      })
    );
  }
}

export interface NetworkAppOrder {
  id: string;
  status: 'completed' | 'canceled' | 'pending';
  network_app_id: string;
  network_app_name: string;
  action: string;
  action_args: Record<string, unknown>;
  price: string;
  fee: string | null;
  total_cost: string;
  quantity: number;
  fund_crypto_transaction_id: string;
  fund_tx_hash: string;
  payment_crypto_transaction_id: string;
  payment_tx_hash: string;
  workflow_id: string;
  owner: string;
  created_at: string;
  expired_at: string;
}
