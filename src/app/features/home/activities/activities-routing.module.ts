import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivitiesPage } from './activities.page';

const routes: Routes = [
  {
    path: '',
    component: ActivitiesPage,
  },
  {
    path: 'capture-transaction-details',
    loadChildren: () =>
      import(
        './capture-transaction-details/capture-transaction-details.module'
      ).then(m => m.TransactionDetailsPageModule),
  },
  {
    path: 'network-action-order-details',
    loadChildren: () =>
      import(
        './network-action-order-details/network-action-order-details.module'
      ).then(m => m.NetworkActionOrderDetailsPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivitiesPageRoutingModule {}
