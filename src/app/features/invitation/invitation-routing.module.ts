import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvitationPage } from './invitation.page';

const routes: Routes = [
  {
    path: '',
    component: InvitationPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvitationPageRoutingModule {}
