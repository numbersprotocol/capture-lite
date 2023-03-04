import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject, EMPTY, Observable, combineLatest, defer } from 'rxjs';
import { concatMap, first, map, pluck, tap } from 'rxjs/operators';
import { CaptureAppWebCryptoApiSignatureProvider } from '../../collector/signature/capture-app-web-crypto-api-signature-provider/capture-app-web-crypto-api-signature-provider.service';
import { DiaBackendAssetRepository } from '../../dia-backend/asset/dia-backend-asset-repository.service';
import { BUBBLE_DB_URL } from '../../dia-backend/secret';
import { NetworkAppOrder } from '../../dia-backend/store/dia-backend-store.service';
import { DiaBackendTransactionRepository } from '../../dia-backend/transaction/dia-backend-transaction-repository.service';
import { Proof } from '../../repositories/proof/proof';
import { ProofRepository } from '../../repositories/proof/proof-repository.service';
import {
  BubbleCreateNewThingResponse,
  GetActionsResponse,
} from './actions.service';

@Injectable({
  providedIn: 'root',
})
export class OrderHistoryService {
  public readonly networkActionOrders$ = new BehaviorSubject<
    BubbleOrderHistoryRecord[]
  >([]);

  constructor(
    private readonly httpClient: HttpClient,
    private readonly capAppWebCryptoApiSignatureProvider: CaptureAppWebCryptoApiSignatureProvider,
    private readonly proofRepository: ProofRepository,
    private readonly sanitizer: DomSanitizer,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository
  ) {}

  refresh$() {
    return combineLatest([
      this.proofRepository.all$,
      this.getOrdersHistory$(),
    ]).pipe(
      first(),
      map(([proofs, orders]) => {
        orders.map(order => {
          order.assetThumbnailUrl$ = this.fetchThumbnailUrl$(proofs, order);
        });
        return orders;
      }),
      tap(orders => this.networkActionOrders$.next(orders))
    );
  }

  createOrderHistory$(networkAppOrder: NetworkAppOrder, cid: string) {
    return defer(() =>
      this.capAppWebCryptoApiSignatureProvider.publicKey$.pipe(
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
      this.capAppWebCryptoApiSignatureProvider.publicKey$.pipe(
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

  fetchThumbnailUrl$(proofs: Proof[], order: BubbleOrderHistoryRecord) {
    // Since Web 3.0 Archive is actually a Capture transaction, grab the thumbnail from
    // `/transactions/{id}/` endpoint.
    if (order.network_app_name_text.includes('Web 3.0 Archive')) {
      if (order.result_tx_text)
        return this.diaBackendTransactionRepository
          .fetchById$(order.result_tx_text)
          .pipe(pluck('asset'), pluck('asset_file_thumbnail'));
      return EMPTY;
    }

    const proof = proofs.find(
      proof => proof.diaBackendAssetId === order.asset_id_text
    );

    return proof
      ? proof.thumbnailUrl$.pipe(
          map(url => {
            if (url) return this.sanitizer.bypassSecurityTrustUrl(url);
            return EMPTY;
          })
        )
      : this.diaBackendAssetRepository
          .fetchById$(order.asset_id_text)
          .pipe(pluck('asset_file_thumbnail'));
  }
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
