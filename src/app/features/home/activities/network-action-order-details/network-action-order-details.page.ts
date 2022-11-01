import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';
import { OrderHistoryService } from '../../../../shared/actions/service/order-history.service';
import { ErrorService } from '../../../../shared/error/error.service';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
import { getAssetProfileForCaptureIframe } from '../../../../utils/url';

const { Browser, Clipboard } = Plugins;
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-network-action-order-details',
  templateUrl: './network-action-order-details.page.html',
  styleUrls: ['./network-action-order-details.page.scss'],
})
export class NetworkActionOrderDetailsPage {
  readonly order$ = combineLatest([
    this.orderHistoryService.networkActionOrders$,
    this.route.paramMap.pipe(
      map(params => params.get('order_id')),
      isNonNullable()
    ),
  ]).pipe(
    first(),
    map(([orders, orderId]) => orders.find(o => o.order_id_text === orderId)),
    isNonNullable(),
    catchError((err: unknown) => this.errorService.toastError$(err))
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly errorService: ErrorService,
    private readonly snackBar: MatSnackBar,
    private readonly translocoService: TranslocoService
  ) {}

  // eslint-disable-next-line class-methods-use-this
  openResultUrl(url: string) {
    if (url) {
      Browser.open({ url, toolbarColor: '#000000' });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  resultUrlFromAssetId(assetId: string) {
    return getAssetProfileForCaptureIframe(assetId);
  }

  async copyToClipboard(value: string) {
    await Clipboard.write({ string: value });
    this.snackBar.open(
      this.translocoService.translate('message.copiedToClipboard')
    );
  }
}
