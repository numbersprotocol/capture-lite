import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, forkJoin, of } from 'rxjs';
import { catchError, concatMap, first, map, take, tap } from 'rxjs/operators';
import { ActionsDialogComponent } from '../../../../shared/actions/actions-dialog/actions-dialog.component';
import {
  Action,
  ActionsService,
} from '../../../../shared/actions/service/actions.service';
import { OrderHistoryService } from '../../../../shared/actions/service/order-history.service';
import { BlockingActionService } from '../../../../shared/blocking-action/blocking-action.service';
import { DiaBackendAuthService } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { DiaBackendSeriesRepository } from '../../../../shared/dia-backend/series/dia-backend-series-repository.service';
import {
  DiaBackendStoreService,
  NetworkAppOrder,
} from '../../../../shared/dia-backend/store/dia-backend-store.service';
import { ErrorService } from '../../../../shared/error/error.service';
import { OrderDetailDialogComponent } from '../../../../shared/order-detail-dialog/order-detail-dialog.component';
import {
  isNonNullable,
  VOID$,
} from '../../../../utils/rx-operators/rx-operators';

@UntilDestroy()
@Component({
  selector: 'app-actions',
  templateUrl: './actions.page.html',
  styleUrls: ['./actions.page.scss'],
})
export class ActionsPage {
  readonly actions$ = this.actionsService
    .getActions$()
    .pipe(catchError((err: unknown) => this.errorService.toastError$(err)));

  private readonly id$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    isNonNullable()
  );

  constructor(
    private readonly actionsService: ActionsService,
    private readonly errorService: ErrorService,
    private readonly translocoService: TranslocoService,
    private readonly blockingActionService: BlockingActionService,
    private readonly route: ActivatedRoute,
    private readonly authService: DiaBackendAuthService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly storeService: DiaBackendStoreService,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly diaBackendStoreService: DiaBackendStoreService,
    private readonly diaBackendSeriesRepository: DiaBackendSeriesRepository
  ) {}

  canPerformAction$(action: Action) {
    if (action.title_text === 'List in CaptureClub') {
      /* 
        Workaround:
        Currently there isn't a simple way to check whether an asset is listed in
        CaptureClub or not. So I first query List all Products API with 
        associated_id parameter set to the assets cid. And then use list series 
        API and check through all nested collections. See discussion here 
        https://app.asana.com/0/0/1201558520076805/1201995911008176/f
      */
      return this.id$.pipe(
        concatMap(cid =>
          forkJoin([
            this.diaBackendStoreService.listAllProducts$({
              associated_id: cid,
              service_name: 'CaptureClub',
            }),
            of(cid),
          ])
        ),
        concatMap(([response, cid]) => {
          if (response.count > 0) {
            throw new Error(
              this.translocoService.translate('message.hasListedInCaptureClub')
            );
          }
          return of(cid);
        }),
        concatMap(async cid => {
          let currentOffset = 0;
          const limit = 100;
          while (true) {
            const response = await this.diaBackendSeriesRepository
              .fetchAll$({ offset: currentOffset, limit })
              .toPromise();
            const listedAsSeries = response.results.some(serie =>
              serie.collections.some(collection =>
                collection.assets.some(asset => asset.cid === cid)
              )
            );
            if (listedAsSeries) {
              throw new Error(
                this.translocoService.translate(
                  'message.hasListedInCaptureClub'
                )
              );
            }
            if (response.next == null) {
              break;
            }
            currentOffset += response.results.length;
          }
          return VOID$;
        }),
        take(1)
      );
    }
    return VOID$;
  }

  openActionDialog$(action: Action) {
    return combineLatest([
      this.actionsService.getParams$(action.params_list_custom_param1 ?? []),
      this.authService.token$,
      this.id$,
    ]).pipe(
      first(),
      concatMap(([params, token, id]) => {
        const dialogRef = this.dialog.open<ActionsDialogComponent>(
          ActionsDialogComponent,
          {
            disableClose: true,
            data: {
              action: action,
              params: params,
            },
          }
        );
        return dialogRef.afterClosed().pipe(
          isNonNullable(),
          concatMap(data =>
            of({
              networkApp: action.network_app_id_text,
              actionArgs: { ...data, token: token, cid: id },
            } as CreateOrderInput)
          )
        );
      })
    );
  }

  openOrderDialog$(orderStatus: NetworkAppOrder) {
    const dialogRef = this.dialog.open<OrderDetailDialogComponent>(
      OrderDetailDialogComponent,
      {
        disableClose: true,
        data: orderStatus,
        width: '80%',
      }
    );
    return dialogRef.afterClosed().pipe(
      isNonNullable(),
      concatMap((orderId: string) => of(orderId))
    );
  }

  createOrder$(appName: string, actionArgs: any) {
    return this.storeService.createNetworkAppOrder(appName, actionArgs).pipe(
      catchError((err: unknown) =>
        this.errorService.toastDiaBackendError$(err)
      ),
      isNonNullable()
    );
  }

  confirmOrder$(id: string) {
    return this.storeService.confirmNetworkAppOrder(id).pipe(
      catchError((err: unknown) =>
        this.errorService.toastDiaBackendError$(err)
      ),
      isNonNullable()
    );
  }

  createOrderHistory$(networkAppOrder: NetworkAppOrder) {
    return this.id$.pipe(
      first(),
      isNonNullable(),
      concatMap(cid =>
        this.orderHistoryService.createOrderHistory$(networkAppOrder, cid)
      ),
      catchError((err: unknown) => {
        return this.errorService.toastError$(err);
      })
    );
  }

  doAction(action: Action) {
    this.blockingActionService
      .run$(this.canPerformAction$(action))
      .pipe(
        catchError((err: unknown) => {
          return this.errorService.toastError$(err);
        }),
        concatMap(() => this.openActionDialog$(action)),
        concatMap(createOrderInput =>
          this.blockingActionService.run$(
            this.createOrder$(
              createOrderInput.networkApp,
              createOrderInput.actionArgs
            )
          )
        ),
        concatMap(orderStatus => this.openOrderDialog$(orderStatus)),
        concatMap(orderId =>
          this.blockingActionService.run$(this.confirmOrder$(orderId))
        ),
        tap(networkAppOrder => {
          /*
            Workaround:
            Create a order history record only if the total cost is > 0 to prevent race condition 
            between app creating the order history record v.s. bubble workflow checking whether a 
            record already exists and if not create a new one, especially for network actions that 
            don't require any cost (and hence backend calls the webhook immediately). See 
            https://dt42-numbers.slack.com/archives/C0323488MEJ/p1648006014291339
          */
          if (Number(networkAppOrder.total_cost) !== 0) {
            this.createOrderHistory$(networkAppOrder).subscribe();
          }
        }),
        tap(() => {
          this.snackBar.open(
            this.translocoService.translate('message.sentSuccessfully')
          );
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}

interface CreateOrderInput {
  networkApp: string;
  actionArgs: any;
}
