import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { FinishedPageRoutingModule } from './finished-routing.module';
import { FinishedPage } from './finished.page';

@NgModule({
  imports: [SharedModule, FinishedPageRoutingModule],
  declarations: [FinishedPage],
})
export class FinishedPageModule {}
