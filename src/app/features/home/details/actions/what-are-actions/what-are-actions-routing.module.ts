import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WhatAreActionsPage } from './what-are-actions.page';

const routes: Routes = [
  {
    path: '',
    component: WhatAreActionsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WhatAreActionsPageRoutingModule {}
