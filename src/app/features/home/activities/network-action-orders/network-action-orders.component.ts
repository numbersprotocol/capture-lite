import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { catchError, finalize, first, map, tap } from 'rxjs/operators';
import {
  DiaBackendStoreService,
  NetworkAppOrderWithThumbnail,
} from '../../../../shared/dia-backend/store/dia-backend-store.service';
import { ErrorService } from '../../../../shared/error/error.service';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-network-action-orders',
  templateUrl: './network-action-orders.component.html',
  styleUrls: ['./network-action-orders.component.scss'],
})
export class NetworkActionOrdersComponent {
  readonly orders$ = new BehaviorSubject<NetworkAppOrderWithThumbnail[]>([]);
  readonly isFetching$ = new BehaviorSubject<boolean>(false);

  readonly isOrdersEmpty$ = combineLatest([
    this.isFetching$,
    this.orders$,
  ]).pipe(map(([isFetching, items]) => !isFetching && items.length === 0));

  private readonly limit = 15;
  private offset = 0;

  constructor(
    private readonly storeService: DiaBackendStoreService,
    private readonly errorService: ErrorService
  ) {
    this.loadData();
  }

  loadData(event?: any) {
    this.isFetching$.next(true);
    this.storeService
      .listAllNetworkAppOrderWithThumbnail$({
        offset: this.offset,
        limit: this.limit,
      })
      .pipe(
        first(),
        tap(({ results }) => {
          this.orders$.next([...this.orders$.value, ...results]);
          this.offset += this.limit;
          event?.target?.complete();
        }),
        catchError((err: unknown) => this.errorService.toastError$(err)),
        finalize(() => this.isFetching$.next(false))
      )
      .subscribe();
  }

  // eslint-disable-next-line class-methods-use-this
  trackByNetworkActionOrder(_: number, item: NetworkAppOrderWithThumbnail) {
    return item.id;
  }
}
