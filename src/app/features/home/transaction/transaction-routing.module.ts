import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionPage } from './transaction.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionPage,
  },
  {
    path: 'transaction-details',
    loadChildren: () =>
      import('./transaction-details/transaction-details.module').then(
        m => m.TransactionDetailsPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionPageRoutingModule {}
