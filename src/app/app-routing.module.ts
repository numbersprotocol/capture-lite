import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/login/login.module').then(m => m.LoginPageModule),
  },
  {
    path: 'signup',
    loadChildren: () =>
      import('./features/signup/signup.module').then(m => m.SignupPageModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.module').then(
        m => m.SettingsPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'privacy',
    loadChildren: () =>
      import('./features/privacy/privacy.module').then(
        m => m.PrivacyPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./features/about/about.module').then(m => m.AboutPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'media-viewer/:src',
    loadChildren: () =>
      import('./shared/media/media-viewer/media-viewer.module').then(
        m => m.MediaViewerPageModule
      ),
  },
  {
    path: 'contacts',
    loadChildren: () =>
      import('./features/contacts/contacts.module').then(
        m => m.ContactsPageModule
      ),
  },
  {
    path: 'wallets',
    loadChildren: () =>
      import('./features/wallets/wallets.module').then(
        m => m.WalletsPageModule
      ),
  },
  {
    path: 'invitation',
    loadChildren: () =>
      import('./features/invitation/invitation.module').then(
        m => m.InvitationPageModule
      ),
  },
  {
    path: 'data-policy',
    loadChildren: () =>
      import('./features/data-policy/data-policy.module').then(
        m => m.DataPolicyPageModule
      ),
  },
  {
    path: 'terms-of-use',
    loadChildren: () =>
      import('./features/terms-of-use/terms-of-use.module').then(
        m => m.TermsOfUsePageModule
      ),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
