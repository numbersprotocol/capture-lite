import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';
import { SendingPostCapturePageRoutingModule } from './sending-post-capture-routing.module';
import { SendingPostCapturePage } from './sending-post-capture.page';

@NgModule({
  imports: [SharedModule, SendingPostCapturePageRoutingModule],
  declarations: [SendingPostCapturePage],
})
export class SendingPostCapturePageModule {}
