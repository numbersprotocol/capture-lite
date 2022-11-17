import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditCaptionPage } from './edit-caption.page';

const routes: Routes = [
  {
    path: '',
    component: EditCaptionPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditCaptionPageRoutingModule {}
