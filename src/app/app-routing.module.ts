import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth/auth-guard.service';
import { LoginGuardService } from './services/auth/login-guard.service';


const routes: Routes = [{
  path: '',
  redirectTo: 'storage',
  pathMatch: 'full'
}, {
  path: 'login',
  loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
  canActivate: [LoginGuardService],
}, {
  path: 'signup',
  loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupPageModule)
}, {
  path: 'storage',
  loadChildren: () => import('./pages/storage/storage.module').then(m => m.StoragePageModule),
  canActivate: [AuthGuardService],
}, {
  path: 'profile',
  loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)
}, {
  path: 'settings',
  loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule),
  canActivate: [AuthGuardService],
}, {
  path: 'privacy',
  loadChildren: () => import('./pages/privacy/privacy.module').then(m => m.PrivacyPageModule)
}, {
  path: 'about',
  loadChildren: () => import('./pages/about/about.module').then(m => m.AboutPageModule),
  canActivate: [AuthGuardService],
  canActivate: [AuthGuardService],

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
