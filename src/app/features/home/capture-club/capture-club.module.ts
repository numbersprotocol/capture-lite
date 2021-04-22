import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CaptureClubPageRoutingModule } from './capture-club-routing.module';
import { CaptureClubPage } from './capture-club.page';

@NgModule({
  imports: [SharedModule, CaptureClubPageRoutingModule],
  declarations: [CaptureClubPage],
})
export class CaptureClubPageModule {}
