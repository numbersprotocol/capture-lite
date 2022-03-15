import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionPage } from './activities.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionPage,
  },
  {
    path: 'capture-transaction-details',
    loadChildren: () =>
      import(
        './capture-transaction-details/capture-transaction-details.module'
      ).then(m => m.TransactionDetailsPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionPageRoutingModule {}
