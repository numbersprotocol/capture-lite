import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { SeriesPageRoutingModule } from './series-routing.module';
import { SeriesPage } from './series.page';

@NgModule({
  imports: [SharedModule, SeriesPageRoutingModule],
  declarations: [SeriesPage],
})
export class SeriesPageModule {}
