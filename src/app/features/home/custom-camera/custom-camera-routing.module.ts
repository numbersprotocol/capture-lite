import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomCameraPage } from './custom-camera.page';

const routes: Routes = [
  {
    path: '',
    component: CustomCameraPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomCameraPageRoutingModule {}
