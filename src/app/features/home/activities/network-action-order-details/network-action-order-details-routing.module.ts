import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NetworkActionOrderDetailsPage } from './network-action-order-details.page';

const routes: Routes = [
  {
    path: '',
    component: NetworkActionOrderDetailsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NetworkActionOrderDetailsPageRoutingModule {}
