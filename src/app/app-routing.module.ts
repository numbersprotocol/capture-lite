import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
  redirectTo: 'storage',
  pathMatch: 'full'
}, {
  path: 'storage',
  loadChildren: () => import('./pages/storage/storage.module').then(m => m.StoragePageModule)
}, {
  path: 'settings',
  loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule)
}, {
  path: 'proof',
  loadChildren: () => import('./pages/proof/proof.module').then(m => m.ProofPageModule)
}];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
