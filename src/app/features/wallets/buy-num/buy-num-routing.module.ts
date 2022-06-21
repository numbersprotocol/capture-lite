import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BuyNumPage } from './buy-num.page';

const routes: Routes = [
  {
    path: '',
    component: BuyNumPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuyNumPageRoutingModule {}
