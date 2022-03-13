import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { defer, forkJoin, Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { WebCryptoApiSignatureProvider } from '../../collector/signature/web-crypto-api-signature-provider/web-crypto-api-signature-provider.service';
import { BUBBLE_DB_URL } from '../../dia-backend/secret';
import { NetworkAppOrder } from '../../dia-backend/store/dia-backend-store.service';

@Injectable({
  providedIn: 'root',
})
export class ActionsService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly webCryptoApiSignatureProvider: WebCryptoApiSignatureProvider
  ) {}

  getActions$() {
    return defer(() =>
      this.httpClient
        .get<GetActionsResponse<Action>>(`${BUBBLE_DB_URL}/api/1.1/obj/action`)
        .pipe(map(response => response.response.results))
    );
  }

  getParams$(ids: string[]) {
    return defer(() =>
      forkJoin(
        ids.map(id =>
          this.httpClient
            .get<GetParamResponse>(`${BUBBLE_DB_URL}/api/1.1/obj/param/${id}`)
            .pipe(map(response => response.response))
        )
      )
    );
  }

  createOrderHistory$(networkAppOrder: NetworkAppOrder, cid: string) {
    return defer(() =>
      this.webCryptoApiSignatureProvider.publicKey$.pipe(
        concatMap(publicKey =>
          this.httpClient.post<BubbleCreateNewThingResponse>(
            `${BUBBLE_DB_URL}/api/1.1/obj/order`,
            {
              asset_id_text: cid,
              gas_fee_number: Number(networkAppOrder.fee),
              network_app_id_text: networkAppOrder.network_app_id,
              network_app_name_text: networkAppOrder.network_app_name,
              order_id_text: networkAppOrder.id,
              price_number: Number(networkAppOrder.price),
              status_text: OrderStatus.Submitted,
              total_cost_number: Number(networkAppOrder.total_cost),
              uid_text: publicKey,
            }
          )
        )
      )
    );
  }

  /*
  By default, bubble data api GET requests return the first 100 items in the list. I think this 
  should be sufficient for most cases. Will support paging to fetch more items in the future.
  */
  getOrdersHistory$() {
    return defer(() =>
      this.webCryptoApiSignatureProvider.publicKey$.pipe(
        concatMap(publicKey =>
          this.httpClient
            .get<GetActionsResponse<BubbleOrderHistoryRecord>>(
              `${BUBBLE_DB_URL}/api/1.1/obj/order`,
              {
                params: {
                  constraints: `[{"key": "uid", "constraint_type": "equals", "value": "${publicKey}" } ]`,
                  sort_field: 'Created Date',
                  descending: true,
                },
              }
            )
            .pipe(map(response => response.response.results))
        )
      )
    );
  }

  send$(url: string, body: any) {
    return this.httpClient.post(url, body);
  }
}

export interface Action {
  readonly action_cost_number: number;
  readonly banner_image_url_text: string;
  readonly base_url_text: string;
  readonly description_text: string;
  readonly params_list_custom_param1: string[];
  readonly title_text: string;
  readonly network_app_id_text: string;
}

export interface Param {
  readonly default_values_list_text: string[];
  readonly description_text: string;
  readonly display_text_text: string;
  readonly name_text: string;
  readonly placeholder_text: string;
  readonly type_text: 'number' | 'text' | 'dropdown';
  readonly user_input_boolean: boolean;
  readonly max_number: number;
  readonly min_number: number;
}

export interface GetActionsResponse<T> {
  readonly response: {
    readonly cursor: number;
    readonly results: T[];
    readonly remaining: number;
    readonly count: number;
  };
}

export interface GetParamResponse {
  readonly response: Param;
}

export interface BubbleCreateNewThingResponse {
  id: string;
  status: string;
}

export interface BubbleOrderHistoryRecord {
  asset_id_text: string;
  gas_fee_number: number;
  network_app_id_text: string;
  network_app_name_text: string;
  order_id_text: string;
  price_number: number;
  status_text:
    | OrderStatus.Submitted
    | OrderStatus.Paid
    | OrderStatus.PaymentFailed
    | OrderStatus.Completed
    | OrderStatus.Failed;
  total_cost_number: number;
  uid_text: string;
  'Created Date': string;
  'Created By': string;
  'Modified Date': string;
  blockchain_name_text: string;
  cost_token_ticker_text: string;
  network_action_cost_number: number;
  result_tx_text: string;
  result_url_text: string;
  _id: string;
  // `assetThumbnailUrl$` field is used only when displaying asset thumbnail at
  // /home/activities
  assetThumbnailUrl$?: Observable<SafeUrl>;
}

export enum OrderStatus {
  Submitted = 'submitted',
  Paid = 'paid',
  PaymentFailed = 'payment_failed',
  Completed = 'completed',
  Failed = 'failed',
}
