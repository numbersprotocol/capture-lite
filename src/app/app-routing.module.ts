import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth/auth.guard';


const routes: Routes = [{
  path: '',
  redirectTo: 'storage',
  pathMatch: 'full'
}, {
  path: 'login',
  loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
}, {
  path: 'signup',
  loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupPageModule)
}, {
  path: 'storage',
  loadChildren: () => import('./pages/storage/storage.module').then(m => m.StoragePageModule),
  canActivate: [AuthGuard]
}, {
  path: 'profile',
  loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule),
  canActivate: [AuthGuard]
}, {
  path: 'settings',
  loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule),
  canActivate: [AuthGuard]
}, {
  path: 'privacy',
  loadChildren: () => import('./pages/privacy/privacy.module').then(m => m.PrivacyPageModule),
  canActivate: [AuthGuard]
}, {
  path: 'about',
  loadChildren: () => import('./pages/about/about.module').then(m => m.AboutPageModule),
  canActivate: [AuthGuard]
}, {
  path: 'history',
  loadChildren: () => import('./pages/history/history.module').then(m => m.HistoryPageModule)
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
