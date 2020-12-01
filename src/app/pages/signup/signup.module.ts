import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { SharedModule } from '../../shared/shared.module';
import { SignupPageRoutingModule } from './signup-routing.module';
import { SignupPage } from './signup.page';

@NgModule({
  imports: [
    SharedModule,
    SignupPageRoutingModule,
    FormlyModule,
    FormlyMaterialModule,
  ],
  declarations: [SignupPage],
})
export class SignupPageModule {}
