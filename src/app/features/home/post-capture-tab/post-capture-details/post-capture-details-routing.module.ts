import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostCaptureDetailsPage } from './post-capture-details.page';

const routes: Routes = [
  {
    path: '',
    component: PostCaptureDetailsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostCaptureDetailsPageRoutingModule {}
