import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaptureDetailsPage } from './capture-details.page';

const routes: Routes = [
  {
    path: '',
    component: CaptureDetailsPage,
  },
  {
    path: 'information',
    loadChildren: () =>
      import('./information/information.module').then(
        m => m.InformationPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaptureDetailsPageRoutingModule {}
