import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  BubbleOrderHistoryRecord,
  OrderHistoryService,
} from '../../../../shared/actions/service/order-history.service';
import { ErrorService } from '../../../../shared/error/error.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-network-action-orders',
  templateUrl: './network-action-orders.component.html',
  styleUrls: ['./network-action-orders.component.scss'],
})
export class NetworkActionOrdersComponent {
  readonly networkActionOrders$ = this.orderHistoryService.networkActionOrders$;

  readonly isFetching$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly orderHistoryService: OrderHistoryService,
    private readonly errorService: ErrorService
  ) {
    this.isFetching$.next(true);
    this.orderHistoryService
      .refresh$()
      .pipe(
        catchError((err: unknown) => this.errorService.toastError$(err)),
        finalize(() => this.isFetching$.next(false)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  // eslint-disable-next-line class-methods-use-this
  trackNetworkActionOrderHistoryRecords(
    _: number,
    item: BubbleOrderHistoryRecord
  ) {
    return item._id;
  }
}
