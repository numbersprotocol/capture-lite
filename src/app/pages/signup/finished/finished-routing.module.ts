import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinishedPage } from './finished.page';

const routes: Routes = [{
  path: '',
  component: FinishedPage
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinishedPageRoutingModule { }
