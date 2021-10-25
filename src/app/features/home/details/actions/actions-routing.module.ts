import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActionsPage } from './actions.page';

const routes: Routes = [
  {
    path: '',
    component: ActionsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionsPageRoutingModule {}
