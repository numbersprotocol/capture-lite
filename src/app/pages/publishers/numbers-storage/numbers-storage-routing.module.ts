import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NumbersStoragePage } from './numbers-storage.page';

const routes: Routes = [{
  path: '',
  component: NumbersStoragePage
}, {
  path: 'login',
  loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
}, {
  path: 'sign-up',
  loadChildren: () => import('./sign-up/sign-up.module').then(m => m.SignUpPageModule)
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NumbersStoragePageRoutingModule { }
