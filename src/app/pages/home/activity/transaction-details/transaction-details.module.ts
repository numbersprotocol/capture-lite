import { NgModule } from '@angular/core';
import { PostCaptureCardModule } from '../../../../shared/post-capture-card/post-capture-card.module';
import { SharedModule } from '../../../../shared/shared.module';
import { TransactionDetailsPageRoutingModule } from './transaction-details-routing.module';
import { TransactionDetailsPage } from './transaction-details.page';

@NgModule({
  imports: [
    SharedModule,
    TransactionDetailsPageRoutingModule,
    PostCaptureCardModule,
  ],
  declarations: [TransactionDetailsPage],
})
export class TransactionDetailsPageModule {}
