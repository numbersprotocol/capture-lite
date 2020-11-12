import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [{
  path: '',
  component: HomePage,
}, {
  path: 'asset',
  loadChildren: () => import('./asset/asset.module').then(m => m.AssetPageModule)
}, {
  path: 'inbox',
  loadChildren: () => import('./inbox/inbox.module').then(m => m.InboxPageModule)
}, {
  path: 'activity',
  loadChildren: () => import('./activity/activity.module').then(m => m.ActivityPageModule)
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule { }
