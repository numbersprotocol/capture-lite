import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { SharedModule } from '../../../shared/shared.module';
import { PhoneVerificationPageRoutingModule } from './phone-verification-routing.module';
import { PhoneVerificationPage } from './phone-verification.page';

@NgModule({
  imports: [
    SharedModule,
    FormlyModule,
    FormlyMaterialModule,
    PhoneVerificationPageRoutingModule,
  ],
  declarations: [PhoneVerificationPage],
})
export class PhoneVerificationPageModule {}
