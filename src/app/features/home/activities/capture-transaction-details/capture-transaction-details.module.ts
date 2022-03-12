import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { TransactionDetailsPageRoutingModule } from './capture-transaction-details-routing.module';
import { TransactionDetailsPage } from './capture-transaction-details.page';

@NgModule({
  imports: [SharedModule, TransactionDetailsPageRoutingModule],
  declarations: [TransactionDetailsPage],
})
export class TransactionDetailsPageModule {}
