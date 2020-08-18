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
}, {
  path: 'information',
  loadChildren: () => import('./pages/information/information.module').then(m => m.InformationPageModule)
}, {
  path: 'publishers',
  redirectTo: 'settings'
}, {
  path: 'publishers/numbers-storage',
  loadChildren: () => import('./pages/publishers/numbers-storage/numbers-storage.module').then(m => m.NumbersStoragePageModule)
}];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'corrected'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
