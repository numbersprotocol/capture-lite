import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
  redirectTo: 'login',
  // redirectTo: 'storage',
  pathMatch: 'full'
},
{
  path: 'login',
  loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
},
{
  path: 'signup',
  loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupPageModule)
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
  path: 'publishers',
  redirectTo: 'settings'
}, {
  path: 'publishers/numbers-storage',
  loadChildren: () => import('./pages/publishers/numbers-storage/numbers-storage.module').then(m => m.NumbersStoragePageModule)
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
},
];

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
