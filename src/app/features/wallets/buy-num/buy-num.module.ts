import { NgModule } from '@angular/core';

import { SharedModule } from '../../../shared/shared.module';
import { BuyNumPageRoutingModule } from './buy-num-routing.module';
import { BuyNumPage } from './buy-num.page';

@NgModule({
  imports: [SharedModule, BuyNumPageRoutingModule],
  declarations: [BuyNumPage],
})
export class BuyNumPageModule {}
