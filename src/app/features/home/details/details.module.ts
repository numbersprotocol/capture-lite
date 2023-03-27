import { NgModule } from '@angular/core';
import { JoyrideModule } from 'ngx-joyride';
import { SwiperModule } from 'swiper/angular';
import { SharedModule } from '../../../shared/shared.module';
import { DetailsIframeComponent } from './details-iframe/details-iframe.component';
import { DetailsPageRoutingModule } from './details-routing.module';
import { DetailsPage } from './details.page';

@NgModule({
  imports: [
    SharedModule,
    DetailsPageRoutingModule,
    SwiperModule,
    JoyrideModule.forChild(),
  ],
  declarations: [DetailsPage, DetailsIframeComponent],
})
export class DetailsPageModule {}
