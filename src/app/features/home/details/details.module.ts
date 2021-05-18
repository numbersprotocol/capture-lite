import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { DetailsPageRoutingModule } from './details-routing.module';
import { DetailsPage } from './details.page';

@NgModule({
  imports: [SharedModule, DetailsPageRoutingModule],
  declarations: [DetailsPage],
})
export class DetailsPageModule {}
