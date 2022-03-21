import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, EMPTY } from 'rxjs';
import { catchError, first, map, pluck } from 'rxjs/operators';
import {
  ActionsService,
  BubbleOrderHistoryRecord,
} from '../../../../shared/actions/service/actions.service';
import { DiaBackendAssetRepository } from '../../../../shared/dia-backend/asset/dia-backend-asset-repository.service';
import { DiaBackendTransactionRepository } from '../../../../shared/dia-backend/transaction/dia-backend-transaction-repository.service';
import { ErrorService } from '../../../../shared/error/error.service';
import { Proof } from '../../../../shared/repositories/proof/proof';
import { ProofRepository } from '../../../../shared/repositories/proof/proof-repository.service';
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'app-network-action-orders',
  templateUrl: './network-action-orders.component.html',
  styleUrls: ['./network-action-orders.component.scss'],
})
export class NetworkActionOrdersComponent {
  readonly networkActionOrders$ = combineLatest([
    this.proofRepository.all$,
    this.actionsService.getOrdersHistory$(),
  ]).pipe(
    first(),
    map(([proofs, orders]) => {
      orders.map(order => {
        order.assetThumbnailUrl$ = this.fetchThumbnailUrl$(proofs, order);
      });
      return orders;
    }),
    catchError((err: unknown) => this.errorService.toastError$(err)),
    untilDestroyed(this)
  );

  constructor(
    private readonly proofRepository: ProofRepository,
    private readonly actionsService: ActionsService,
    private readonly sanitizer: DomSanitizer,
    private readonly diaBackendTransactionRepository: DiaBackendTransactionRepository,
    private readonly diaBackendAssetRepository: DiaBackendAssetRepository,
    private readonly errorService: ErrorService
  ) {}

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

  // eslint-disable-next-line class-methods-use-this
  trackNetworkActionOrderHistoryRecords(
    _: number,
    item: BubbleOrderHistoryRecord
  ) {
    return item._id;
  }
}
