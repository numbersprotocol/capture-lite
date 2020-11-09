import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoragePage } from './storage.page';

const routes: Routes = [{
  path: '',
  component: StoragePage,
}, {
  path: 'proof',
  loadChildren: () => import('./proof/proof.module').then(m => m.ProofPageModule)
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoragePageRoutingModule { }
