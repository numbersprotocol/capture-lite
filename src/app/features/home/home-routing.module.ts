import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'inbox',
    loadChildren: () =>
      import('./inbox/inbox.module').then(m => m.InboxPageModule),
  },
  {
    path: 'transaction',
    loadChildren: () =>
      import('./transaction/transaction.module').then(
        m => m.TransactionPageModule
      ),
  },
  {
    path: 'tutorial',
    loadChildren: () =>
      import('./onboarding/tutorial/tutorial.module').then(
        m => m.TutorialPageModule
      ),
  },
  {
    path: 'series',
    loadChildren: () =>
      import('./post-capture-tab/series/series.module').then(
        m => m.SeriesPageModule
      ),
  },
  {
    path: 'sending-post-capture',
    loadChildren: () =>
      import('./sending-post-capture/sending-post-capture.module').then(
        m => m.SendingPostCapturePageModule
      ),
  },
  {
    path: 'details',
    loadChildren: () =>
      import('./details/details.module').then(m => m.DetailsPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
