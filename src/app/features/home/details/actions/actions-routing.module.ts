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
  {
    path: 'what-are-actions',
    loadChildren: () =>
      import('./what-are-actions/what-are-actions.module').then(
        m => m.WhatAreActionsPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionsPageRoutingModule {}
