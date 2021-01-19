import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tutorial',
    pathMatch: 'full',
  },
  {
    path: 'tutorial',
    loadChildren: () =>
      import('./tutorial/tutorial.module').then(m => m.TutorialPageModule),
  },
  {
    path: 'prefetching',
    loadChildren: () =>
      import('./prefetching/prefetching.module').then(
        m => m.PrefetchingPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnboardingPageRoutingModule {}
