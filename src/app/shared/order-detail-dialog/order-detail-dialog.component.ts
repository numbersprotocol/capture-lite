import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NetworkAppOrder } from '../dia-backend/store/dia-backend-store.service';
import { DiaBackendWalletService } from '../dia-backend/wallet/dia-backend-wallet.service';

@Component({
  selector: 'app-order-detail-dialog',
  templateUrl: './order-detail-dialog.component.html',
  styleUrls: ['./order-detail-dialog.component.scss'],
})
export class OrderDetailDialogComponent {
  readonly orderStatus: NetworkAppOrder;
  num_charged = 0;
  readonly asset_wallet_mainnet_num_balance$ =
    this.diaBackendWalletService.assetWalletMainnetNumBalance$;

  constructor(
    private readonly dialogRef: MatDialogRef<OrderDetailDialogComponent>,
    private readonly diaBackendWalletService: DiaBackendWalletService,
    @Inject(MAT_DIALOG_DATA) public data: NetworkAppOrder
  ) {
    this.orderStatus = data;
    this.num_charged = Number(data.num_charged);
  }

  ok() {
    this.dialogRef.close(this.orderStatus.id);
  }

  cancel() {
    this.dialogRef.close();
  }
}
