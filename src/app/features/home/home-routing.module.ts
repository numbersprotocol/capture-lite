import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'capture-details',
    loadChildren: () =>
      import('./capture-tab/capture-details/capture-details.module').then(
        m => m.CaptureDetailsPageModule
      ),
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
    path: 'post-capture-details',
    loadChildren: () =>
      import(
        './post-capture-tab/post-capture-details/post-capture-details.module'
      ).then(m => m.PostCaptureDetailsPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
