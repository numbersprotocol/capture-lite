import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailVerificationPage } from './email-verification.page';

const routes: Routes = [
  {
    path: '',
    component: EmailVerificationPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmailVerificationPageRoutingModule {}
