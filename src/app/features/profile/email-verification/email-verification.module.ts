import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { EmailVerificationPageRoutingModule } from './email-verification-routing.module';
import { EmailVerificationPage } from './email-verification.page';

@NgModule({
  imports: [SharedModule, EmailVerificationPageRoutingModule],
  declarations: [EmailVerificationPage],
})
export class EmailVerificationPageModule {}
