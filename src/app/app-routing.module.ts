import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
  redirectTo: 'storage',
  pathMatch: 'full'
},
{
  path: 'storage',
  loadChildren: () => import('./pages/storage/storage.module').then(m => m.StoragePageModule)
},
{
  path: 'settings',
  loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule)
}, {
  path: 'proof',
  loadChildren: () => import('./pages/proof/proof.module').then(m => m.ProofPageModule)
}, {
  path: 'information',
  loadChildren: () => import('./pages/information/information.module').then(m => m.InformationPageModule)
}, {
  path: 'general',
  loadChildren: () => import('./pages/general/general.module').then(m => m.GeneralPageModule)
}, {
  path: 'defaultinformationprovider',
  // tslint:disable-next-line: max-line-length
  loadChildren: () => import('./pages/defaultinformationprovider/defaultinformationprovider.module').then(m => m.DefaultInformationProviderPageModule)
}, {
  path: 'defaultsignature',
  loadChildren: () => import('./pages/defaultsignature/defaultsignature.module').then(m => m.DefaultSignaturePageModule)
}, {
  path: 'about',
  loadChildren: () => import('./pages/about/about.module').then(m => m.AboutPageModule)
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
