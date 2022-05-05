import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvitationPageRoutingModule } from './invitation-routing.module';

import { InvitationPage } from './invitation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvitationPageRoutingModule,
  ],
  declarations: [InvitationPage],
})
export class InvitationPageModule {}
