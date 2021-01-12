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
  {
    path: 'sending-post-capture',
    loadChildren: () =>
      import('./sending-post-capture/sending-post-capture.module').then(
        m => m.SendingPostCapturePageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaptureDetailsPageRoutingModule {}
