import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityPage } from './activity.page';

const routes: Routes = [
  {
    path: '',
    component: ActivityPage,
  },
  {
    path: 'detail',
    loadChildren: () =>
      import('./detail/detail.module').then(m => m.DetailPageModule),
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
export class ActivityPageRoutingModule {}
