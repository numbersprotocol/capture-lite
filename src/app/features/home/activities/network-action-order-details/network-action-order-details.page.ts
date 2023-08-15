import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { NavController } from '@ionic/angular';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, combineLatest, fromEvent } from 'rxjs';
import {
  catchError,
  concatMap,
  first,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { OrderHistoryService } from '../../../../shared/actions/service/order-history.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { DiaBackendStoreService } from '../../../../shared/dia-backend/store/dia-backend-store.service';
import { ErrorService } from '../../../../shared/error/error.service';
import { BubbleToIonicPostMessage } from '../../../../shared/iframe/iframe';
import { NetworkService } from '../../../../shared/network/network.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
import { getAssetProfileForNSE } from '../../../../utils/url';

const { Browser, Clipboard } = Plugins;
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-network-action-order-details',
  templateUrl: './network-action-order-details.page.html',
  styleUrls: ['./network-action-order-details.page.scss'],
})
export class NetworkActionOrderDetailsPage {
  readonly orderId$ = this.route.paramMap.pipe(
    map(params => params.get('order_id')),
    isNonNullable()
  );
  readonly assetId$ = this.orderId$.pipe(
    switchMap(orderId => this.storeService.retrieveNetworkAppOrder$(orderId)),
    map(order => {
      if ('nid' in order.action_args) return order.action_args.nid as string;
      if ('cid' in order.action_args) return order.action_args.cid as string;
      return undefined;
    })
  );
  readonly order$ = combineLatest([
    this.orderHistoryService.networkActionOrders$,
    this.orderId$,
  ]).pipe(
    first(),
    map(([orders, orderId]) => orders.find(o => o.order_id_text === orderId)),
    isNonNullable(),
    catchError((err: unknown) => this.errorService.toastError$(err))
  );
  readonly isOffline$ = this.networkService.connected$.pipe(
    map(connected => connected === false)
  );

  readonly iframeUrl$ = combineLatest([this.orderId$, this.assetId$]).pipe(
    map(([orderId, assetId]) => {
      const queryParams = new URLSearchParams();

      queryParams.append('order_id', orderId);

      /**
       * Some network action orders might not have releated asset id (aka nid, cid).
       * For example:
       * - "Creator Gallery"
       * - "One-NUM-price"
       * - "CustodialWalletWithdraw"
       * - etc
       */
      if (assetId) queryParams.append('asset_id', assetId);

      return `${BUBBLE_IFRAME_URL}/version-test/order_details?${queryParams}`;
    })
  );

  readonly iframeLoaded$ = new BehaviorSubject(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly storeService: DiaBackendStoreService,
    private readonly errorService: ErrorService,
    private readonly snackBar: MatSnackBar,
    private readonly translocoService: TranslocoService,
    private readonly networkService: NetworkService,
    private readonly navController: NavController
  ) {
    this.processIframeEvents();
  }

  private processIframeEvents() {
    fromEvent(window, 'message')
      .pipe(
        tap(event => {
          const postMessageEvent = event as MessageEvent;
          const data = postMessageEvent.data as BubbleToIonicPostMessage;
          switch (data) {
            case BubbleToIonicPostMessage.IFRAME_ON_LOAD:
              this.iframeLoaded$.next(true);
              break;
            case BubbleToIonicPostMessage.IFRAME_BACK_BUTTON_CLICKED:
              this.navController.back();
              break;
            case BubbleToIonicPostMessage.IFRAME_COPY_TO_CLIPBOARD_ORDER_ID:
              this.copyToClipboardOrderId();
              break;
            default:
              break;
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private copyToClipboardOrderId() {
    this.orderId$
      .pipe(
        first(),
        concatMap(orderId => this.copyToClipboard(orderId))
      )
      .subscribe();
  }

  // eslint-disable-next-line class-methods-use-this
  openResultUrl(url: string) {
    if (url) {
      Browser.open({ url, toolbarColor: '#000000' });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  resultUrlFromAssetId(assetId: string) {
    return getAssetProfileForNSE(assetId);
  }

  async copyToClipboard(value: string) {
    await Clipboard.write({ string: value });
    this.snackBar.open(
      this.translocoService.translate('message.copiedToClipboard')
    );
  }
}
