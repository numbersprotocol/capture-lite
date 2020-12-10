import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'asset',
    loadChildren: () =>
      import('./asset/asset.module').then(m => m.AssetPageModule),
  },
  {
    path: 'inbox',
    loadChildren: () =>
      import('./inbox/inbox.module').then(m => m.InboxPageModule),
  },
  {
    path: 'transaction',
    loadChildren: () =>
      import('./transaction/transaction.module').then(
        m => m.TransactionPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
