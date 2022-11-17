import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetailsPage } from './details.page';

const routes: Routes = [
  {
    path: '',
    component: DetailsPage,
  },
  {
    path: 'information',
    loadChildren: () =>
      import('./information/information.module').then(
        m => m.InformationPageModule
      ),
  },
  {
    path: 'actions',
    loadChildren: () =>
      import('./actions/actions.module').then(m => m.ActionsPageModule),
  },
  {
    path: 'edit-caption',
    loadChildren: () =>
      import('./edit-caption/edit-caption.module').then(
        m => m.EditCaptionPageModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailsPageRoutingModule {}
