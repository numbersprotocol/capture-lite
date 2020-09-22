import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultSignaturePage } from './defaultsignature.page';


const routes: Routes = [
  {
    path: '',
    component: DefaultSignaturePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefaultSignaturePageRoutingModule { }
