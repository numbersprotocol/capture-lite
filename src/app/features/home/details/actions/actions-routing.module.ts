import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActionsPage } from './actions.page';

const routes: Routes = [
  {
    path: '',
    component: ActionsPage,
  },
  {
    path: 'action-details',
    loadChildren: () =>
      import('./action-details/action-details.module').then(
        m => m.ActionDetailsPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionsPageRoutingModule {}
