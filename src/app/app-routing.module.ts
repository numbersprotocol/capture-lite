import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from './services/auth/auth-guard.service';

const routes: Routes = [{
  path: '',
  redirectTo: 'storage',
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
  loadChildren: () => import('./pages/storage/storage.module').then(m => m.StoragePageModule),
  canActivate: [AuthGuardService],
},
{
  path: 'settings',
  loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule),
  canActivate: [AuthGuardService],
}, {
  path: 'proof',
  loadChildren: () => import('./pages/proof/proof.module').then(m => m.ProofPageModule),
  canActivate: [AuthGuardService],
}, {
  path: 'information',
  loadChildren: () => import('./pages/information/information.module').then(m => m.InformationPageModule),
  canActivate: [AuthGuardService],
}, {
  path: 'publishers',
  redirectTo: 'settings',
  canActivate: [AuthGuardService],
}, {
  path: 'publishers/numbers-storage',
  loadChildren: () => import('./pages/publishers/numbers-storage/numbers-storage.module').then(m => m.NumbersStoragePageModule),
  canActivate: [AuthGuardService],
}, {
  path: 'general',
  loadChildren: () => import('./pages/general/general.module').then(m => m.GeneralPageModule),
  canActivate: [AuthGuardService],
}, {
  path: 'defaultinformationprovider',
  // tslint:disable-next-line: max-line-length
  loadChildren: () => import('./pages/defaultinformationprovider/defaultinformationprovider.module').then(m => m.DefaultInformationProviderPageModule),
  canActivate: [AuthGuardService],
}, {
  path: 'defaultsignature',
  loadChildren: () => import('./pages/defaultsignature/defaultsignature.module').then(m => m.DefaultSignaturePageModule),
  canActivate: [AuthGuardService],
}, {
  path: 'about',
  loadChildren: () => import('./pages/about/about.module').then(m => m.AboutPageModule),
  canActivate: [AuthGuardService],
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
