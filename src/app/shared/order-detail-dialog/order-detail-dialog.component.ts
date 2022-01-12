import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NetworkAppOrderStatus } from '../dia-backend/store/dia-backend-store.service';

@Component({
  selector: 'app-order-detail-dialog',
  templateUrl: './order-detail-dialog.component.html',
  styleUrls: ['./order-detail-dialog.component.scss'],
})
export class OrderDetailDialogComponent {
  readonly orderStatus: NetworkAppOrderStatus;

  constructor(
    private readonly dialogRef: MatDialogRef<OrderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NetworkAppOrderStatus
  ) {
    this.orderStatus = data;
  }

  ok() {
    this.dialogRef.close(this.orderStatus.id);
  }

  cancel() {
    this.dialogRef.close();
  }
}
