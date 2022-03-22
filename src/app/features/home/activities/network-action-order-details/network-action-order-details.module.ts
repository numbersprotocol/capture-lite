import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { NetworkActionOrderDetailsPageRoutingModule } from './network-action-order-details-routing.module';
import { NetworkActionOrderDetailsPage } from './network-action-order-details.page';

@NgModule({
  imports: [SharedModule, NetworkActionOrderDetailsPageRoutingModule],
  declarations: [NetworkActionOrderDetailsPage],
})
export class NetworkActionOrderDetailsPageModule {}
