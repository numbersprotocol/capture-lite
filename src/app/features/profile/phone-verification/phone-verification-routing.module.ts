import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhoneVerificationPage } from './phone-verification.page';

const routes: Routes = [
  {
    path: '',
    component: PhoneVerificationPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhoneVerificationPageRoutingModule {}
