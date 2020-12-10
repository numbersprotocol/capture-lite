import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionDetailsPage } from './transaction-details.page';

const routes: Routes = [
  {
    path: '',
    component: TransactionDetailsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionDetailsPageRoutingModule {}
