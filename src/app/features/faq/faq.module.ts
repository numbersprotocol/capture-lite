import { NgModule } from '@angular/core';

import { FaqPageRoutingModule } from './faq-routing.module';

import { SharedModule } from '../../shared/shared.module';
import { FaqPage } from './faq.page';

@NgModule({
  imports: [SharedModule, FaqPageRoutingModule],
  declarations: [FaqPage],
})
export class FaqPageModule {}
