import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { StoragePageModule } from './pages/storage/storage.module';

const routes: Routes = [
  {
    path: 'stosrage',
    component: StoragePageModule,
    children: [
      {
        path: 'schedule',
        children: [
          {
            path: 'All',
            loadChildren: () => import('./pages/storage/storage.module').then(m => m.StoragePageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/app/tabs/schedule',
        pathMatch: 'full'
      }
    ]
  }, {
    path: '',
    redirectTo: 'storage',
    pathMatch: 'full'
  },
  {
    path: 'storage',
    children: [
      {
        path: 'All',
        loadChildren: () => import('./pages/storage/storage.module').then(m => m.StoragePageModule)
      },
      {
        path: 'Tage',
        loadChildren: () => import('./pages/proof/proof.module').then(m => m.ProofPageModule)
      }
    ]
  },
  // {
  //   path: 'storage',
  //   loadChildren: () => import('./pages/storage/storage.module').then(m => m.StoragePageModule)
  // },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule)
  }, {
    path: 'proof',
    loadChildren: () => import('./pages/proof/proof.module').then(m => m.ProofPageModule)
  }, {
    path: 'information',
    loadChildren: () => import('./pages/information/information.module').then(m => m.InformationPageModule)
  }];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'corrected'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
