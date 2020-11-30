import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SendingPostCapturePage } from './sending-post-capture.page';

const routes: Routes = [
  {
    path: '',
    component: SendingPostCapturePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SendingPostCapturePageRoutingModule {}
