import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { JoyrideModule } from 'ngx-joyride';
import { SwiperModule } from 'swiper/angular';
import { SharedModule } from '../../../shared/shared.module';
import { CaptureDetailsWithIframeComponent } from './capture-details-with-iframe/capture-details-with-iframe.component';
import { CaptureDetailsWithIonicComponent } from './capture-details-with-ionic/capture-details-with-ionic.component';
import { DetailsPageRoutingModule } from './details-routing.module';
import { DetailsUploadingBarComponent } from './details-uploading-bar/details-uploading-bar.component';
import { DetailsPage } from './details.page';

@NgModule({
  imports: [
    SharedModule,
    DetailsPageRoutingModule,
    SwiperModule,
    JoyrideModule.forChild(),
  ],
  providers: [DatePipe],
  declarations: [
    DetailsPage,
    CaptureDetailsWithIframeComponent,
    CaptureDetailsWithIonicComponent,
    DetailsUploadingBarComponent,
  ],
})
export class DetailsPageModule {}
