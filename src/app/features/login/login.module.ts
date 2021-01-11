import { NgModule } from '@angular/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { SharedModule } from '../../shared/shared.module';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';

@NgModule({
  imports: [
    SharedModule,
    LoginPageRoutingModule,
    FormlyModule,
    FormlyMaterialModule,
  ],
  declarations: [LoginPage],
})
export class LoginPageModule {}
