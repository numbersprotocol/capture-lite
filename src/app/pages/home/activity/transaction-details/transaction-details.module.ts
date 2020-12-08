import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { TransactionDetailsPageRoutingModule } from './transaction-details-routing.module';
import { TransactionDetailsPage } from './transaction-details.page';

@NgModule({
  imports: [SharedModule, TransactionDetailsPageRoutingModule],
  declarations: [TransactionDetailsPage],
})
export class TransactionDetailsPageModule {}
