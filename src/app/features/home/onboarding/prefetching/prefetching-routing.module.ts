import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrefetchingPage } from './prefetching.page';

const routes: Routes = [
  {
    path: '',
    component: PrefetchingPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrefetchingPageRoutingModule {}
