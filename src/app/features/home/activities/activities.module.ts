import { NgModule } from '@angular/core';
import { JoyrideModule } from 'ngx-joyride';
import { SharedModule } from '../../../shared/shared.module';
import { ActivitiesPageRoutingModule } from './activities-routing.module';
import { ActivitiesPage } from './activities.page';
import { CaptureTransactionsComponent } from './capture-transactions/capture-transactions.component';
import { NetworkActionOrdersComponent } from './network-action-orders/network-action-orders.component';

@NgModule({
  imports: [
    SharedModule,
    ActivitiesPageRoutingModule,
    JoyrideModule.forChild(),
  ],
  declarations: [
    ActivitiesPage,
    CaptureTransactionsComponent,
    NetworkActionOrdersComponent,
  ],
})
export class ActivitiesPageModule {}
