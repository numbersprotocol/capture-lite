import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { TransactionPageRoutingModule } from './transaction-routing.module';
import { TransactionPage } from './transaction.page';

@NgModule({
  imports: [SharedModule, TransactionPageRoutingModule],
  declarations: [TransactionPage],
})
export class TransactionPageModule {}
