import { NgModule } from '@angular/core';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { SharedModule } from '../../shared.module';
import { MediaViewerPageRoutingModule } from './media-viewer-routing.module';
import { MediaViewerPage } from './media-viewer.page';

@NgModule({
  imports: [SharedModule, MediaViewerPageRoutingModule, PinchZoomModule],
  declarations: [MediaViewerPage],
})
export class MediaViewerPageModule {}
