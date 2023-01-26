import { NgModule } from '@angular/core';

import { DataPolicyPageRoutingModule } from './data-policy-routing.module';

import { SharedModule } from '../../shared/shared.module';
import { DataPolicyPage } from './data-policy.page';

@NgModule({
  imports: [SharedModule, DataPolicyPageRoutingModule],
  declarations: [DataPolicyPage],
})
export class DataPolicyPageModule {}
