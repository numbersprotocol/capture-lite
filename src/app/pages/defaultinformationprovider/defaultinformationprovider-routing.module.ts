import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultInformationProviderPage } from './defaultinformationprovider.page';


const routes: Routes = [
  {
    path: '',
    component: DefaultInformationProviderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefaultInformationProviderPageRoutingModule { }
