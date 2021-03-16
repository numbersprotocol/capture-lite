import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../../../shared/shared.module';
import { SeriesPageRoutingModule } from './series-routing.module';
import { SeriesPage } from './series.page';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    IonicModule,
    SeriesPageRoutingModule,
  ],
  declarations: [SeriesPage],
})
export class SeriesPageModule {}
