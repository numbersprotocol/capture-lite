import { NgModule } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { SharedModule } from '../../shared.module';
import { SeriesCardComponent } from './series-card.component';

@NgModule({
  declarations: [SeriesCardComponent],
  imports: [SharedModule, TranslocoModule],
  exports: [SeriesCardComponent],
})
export class SeriesCardModule {}
