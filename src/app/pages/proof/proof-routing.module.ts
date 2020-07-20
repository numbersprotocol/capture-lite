import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProofPage } from './proof.page';

const routes: Routes = [
  {
    path: '',
    component: ProofPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProofPageRoutingModule {}
