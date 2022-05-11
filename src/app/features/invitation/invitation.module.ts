import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { InvitationPageRoutingModule } from './invitation-routing.module';
import { InvitationPage } from './invitation.page';

@NgModule({
  imports: [SharedModule, InvitationPageRoutingModule],
  declarations: [InvitationPage],
})
export class InvitationPageModule {}
