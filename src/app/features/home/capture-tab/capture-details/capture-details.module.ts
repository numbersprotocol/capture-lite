import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CaptureDetailsPageRoutingModule } from './capture-details-routing.module';
import { CaptureDetailsPage } from './capture-details.page';

@NgModule({
  imports: [SharedModule, CaptureDetailsPageRoutingModule],
  declarations: [CaptureDetailsPage],
})
export class CaptureDetailsPageModule {}
