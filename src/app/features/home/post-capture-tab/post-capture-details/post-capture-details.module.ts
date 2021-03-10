import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { PostCaptureDetailsPageRoutingModule } from './post-capture-details-routing.module';
import { PostCaptureDetailsPage } from './post-capture-details.page';

@NgModule({
  imports: [SharedModule, PostCaptureDetailsPageRoutingModule],
  declarations: [PostCaptureDetailsPage],
})
export class PostCaptureDetailsPageModule {}
