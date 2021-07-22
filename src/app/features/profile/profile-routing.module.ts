import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
  {
    path: 'phone-verification',
    loadChildren: () =>
      import('./phone-verification/phone-verification.module').then(
        m => m.PhoneVerificationPageModule
      ),
  },
  {
    path: 'email-verification',
    loadChildren: () =>
      import('./email-verification/email-verification.module').then(
        m => m.EmailVerificationPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
