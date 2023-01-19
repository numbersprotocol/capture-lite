import { NgModule } from '@angular/core';

import { TermsOfUsePageRoutingModule } from './terms-of-use-routing.module';

import { SharedModule } from '../../shared/shared.module';
import { TermsOfUsePage } from './terms-of-use.page';

@NgModule({
  imports: [SharedModule, TermsOfUsePageRoutingModule],
  declarations: [TermsOfUsePage],
})
export class TermsOfUsePageModule {}
