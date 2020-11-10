import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoragePage } from './storage.page';

const routes: Routes = [{
  path: '',
  component: StoragePage,
}, {
  path: 'asset',
  loadChildren: () => import('./asset/asset.module').then(m => m.AssetPageModule)
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoragePageRoutingModule { }
