import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InformationPage } from './information.page';

const routes: Routes = [
  {
    path: '',
    component: InformationPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InformationPageRoutingModule {}
