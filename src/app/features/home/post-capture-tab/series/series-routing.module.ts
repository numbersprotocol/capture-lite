import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeriesPage } from './series.page';

const routes: Routes = [
  {
    path: '',
    component: SeriesPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeriesPageRoutingModule {}
