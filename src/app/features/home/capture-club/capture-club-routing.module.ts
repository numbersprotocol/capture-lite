import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaptureClubPage } from './capture-club.page';

const routes: Routes = [
  {
    path: '',
    component: CaptureClubPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaptureClubPageRoutingModule {}
