import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { TransactionPageRoutingModule } from './activities-routing.module';
import { TransactionPage } from './activities.page';
import { CaptureTransactionsComponent } from './capture-transactions/capture-transactions.component';
import { NetworkActionOrdersComponent } from './network-action-orders/network-action-orders.component';

@NgModule({
  imports: [SharedModule, TransactionPageRoutingModule],
  declarations: [
    TransactionPage,
    CaptureTransactionsComponent,
    NetworkActionOrdersComponent,
  ],
})
export class TransactionPageModule {}
