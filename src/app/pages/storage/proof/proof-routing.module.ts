import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/services/auth/auth-guard.service';
import { ProofPage } from './proof.page';

const routes: Routes = [{
  path: '',
  component: ProofPage
}, {
  path: 'information',
  loadChildren: () => import('./information/information.module').then(m => m.InformationPageModule),
  canActivate: [AuthGuardService]
}, {
  path: 'sending-post-capture',
  loadChildren: () => import('./sending-post-capture/sending-post-capture.module').then(m => m.SendingPostCapturePageModule),
  canActivate: [AuthGuardService]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProofPageRoutingModule { }
