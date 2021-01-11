import { NgModule } from '@angular/core';
import { PostCaptureCardModule } from '../../../../shared/core/post-capture-card/post-capture-card.module';
import { SharedModule } from '../../../../shared/shared.module';
import { SendingPostCapturePageRoutingModule } from './sending-post-capture-routing.module';
import { SendingPostCapturePage } from './sending-post-capture.page';

@NgModule({
  imports: [
    SharedModule,
    SendingPostCapturePageRoutingModule,
    PostCaptureCardModule,
  ],
  declarations: [SendingPostCapturePage],
})
export class SendingPostCapturePageModule {}
