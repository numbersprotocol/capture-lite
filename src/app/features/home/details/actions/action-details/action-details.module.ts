import { NgModule } from '@angular/core';

import { ActionDetailsPageRoutingModule } from './action-details-routing.module';

import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { SharedModule } from '../../../../../shared/shared.module';
import { ActionDetailsPage } from './action-details.page';

@NgModule({
  imports: [
    SharedModule,
    ActionDetailsPageRoutingModule,
    FormlyModule,
    FormlyMaterialModule,
  ],
  declarations: [ActionDetailsPage],
})
export class ActionDetailsPageModule {}
