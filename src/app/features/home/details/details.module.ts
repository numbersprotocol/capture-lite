import { NgModule } from '@angular/core';
import { SwiperModule } from 'swiper/angular';
import { SharedModule } from '../../../shared/shared.module';
import { DetailsPageRoutingModule } from './details-routing.module';
import { DetailsPage } from './details.page';

@NgModule({
  imports: [SharedModule, DetailsPageRoutingModule, SwiperModule],
  declarations: [DetailsPage],
})
export class DetailsPageModule {}
