import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsPage } from './settings.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
  },
  {
    path: 'email-verification',
    loadChildren: () =>
      import('./email-verification/email-verification.module').then(
        m => m.EmailVerificationPageModule
      ),
  },
  {
    path: 'go-pro',
    loadChildren: () =>
      import('./go-pro/go-pro.module').then(m => m.GoProPageModule),
  },
  {
    path: 'user-guide',
    loadChildren: () =>
      import('./user-guide/user-guide.module').then(m => m.UserGuidePageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
