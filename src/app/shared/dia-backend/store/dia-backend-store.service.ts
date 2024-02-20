import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, defer } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { DiaBackendAssetRepository } from '../asset/dia-backend-asset-repository.service';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { PaginatedResponse } from '../pagination';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendStoreService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository
  ) {}

  listAllNetworkAppOrders$({
    offset,
    limit,
  }: {
    offset?: number;
    limit?: number;
  }) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        let params = new HttpParams();
        if (offset !== undefined) {
          params = params.set('offset', offset);
        }

        if (limit !== undefined) {
          params = params.set('limit', limit);
        }

        return this.httpClient.get<PaginatedResponse<NetworkAppOrder>>(
          `${BASE_URL}/api/v3/store/network-app-orders/`,
          { headers, params }
        );
      })
    );
  }

  /**
   * Fetches a paginated list of network app orders along with their associated thumbnails,
   * if available. The result will be a paginated response containing an array of
   * `NetworkAppOrderWithThumbnail` objects. Since the basic `NetworkAppOrder` type does
   * not include thumbnail information, we extend it with the `NetworkAppOrderWithThumbnail`
   * type to incorporate thumbnail details when available.
   */
  listAllNetworkAppOrderWithThumbnail$({
    offset,
    limit,
  }: {
    offset?: number;
    limit?: number;
  }): Observable<PaginatedResponse<NetworkAppOrderWithThumbnail>> {
    return this.listAllNetworkAppOrders$({ offset, limit }).pipe(
      map(({ count, results, next, previous }) => {
        const resultsWithThumbnail = results.map<NetworkAppOrderWithThumbnail>(
          order => ({
            ...order,
            assetThumbnailUrl$: this.fetchAssetThumbnailUrl$(order),
          })
        );
        return { count, results: resultsWithThumbnail, next, previous };
      })
    );
  }

  fetchAssetThumbnailUrl$(order: NetworkAppOrder) {
    let id: string | undefined;

    if (typeof order.action_args.nid === 'string') {
      id = order.action_args.nid;
    } else if (typeof order.action_args.cid === 'string') {
      id = order.action_args.cid;
    }

    if (id) {
      return this.diaBackendAssetRepository
        .fetchById$(id)
        .pipe(map(asset => asset.asset_file_thumbnail));
    }

    return EMPTY;
  }

  retrieveNetworkAppOrder$(id: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        return this.httpClient.get<NetworkAppOrder>(
          `${BASE_URL}/api/v3/store/network-app-orders/${id}`,
          { headers }
        );
      })
    );
  }

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

  listAllProducts$(
    queryParams: { associated_id?: string; service_name?: string } = {}
  ) {
    return defer(() => this.authService.getAuthHeadersWithApiKey()).pipe(
      concatMap(headers => {
        const params = new HttpParams({ fromObject: queryParams });
        return this.httpClient.get<PaginatedResponse<Product>>(
          `${BASE_URL}/api/v3/store/products/`,
          { headers, params }
        );
      })
    );
  }

  unpublish$(id: string) {
    return defer(() => this.authService.getAuthHeadersWithApiKey()).pipe(
      concatMap(headers => {
        return this.httpClient.post(
          `${BASE_URL}/api/v3/store/products/${id}/disable/`,
          {},
          { headers }
        );
      })
    );
  }
}

export interface NetworkAppOrder {
  id: string;
  status: 'created' | 'success' | 'failure' | 'pending';
  network_app_id: string;
  network_app_name: string;
  action: string;
  action_args: Record<string, unknown>;
  price: string;
  fee: string | null;
  num_charged: string;
  num_paid: string;
  points_charged: string;
  points_paid: string;
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

export interface NetworkAppOrderWithThumbnail extends NetworkAppOrder {
  assetThumbnailUrl$?: Observable<string>;
}

export interface Product {
  id: string;
  associated_id: string;
  type: string;
  service_name: string;
  subject: string;
  description: string;
  tags: string[];
  cover_image: string;
  cover_image_thumbnail: string;
  product_url: string;
  external_product_url: string;
  price: string;
  price_base: 'usd' | 'num';
  quantity: number;
  in_stock: number;
  nft_token_id: number;
  nft_token_uri: string;
  nft_blockchain_name: string;
  nft_contract_address: string;
  owner: string;
  owner_name: string;
  original_creator: string;
  original_creator_name: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
