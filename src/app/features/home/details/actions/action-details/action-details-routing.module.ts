import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActionDetailsPage } from './action-details.page';

const routes: Routes = [
  {
    path: '',
    component: ActionDetailsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionDetailsPageRoutingModule {}
