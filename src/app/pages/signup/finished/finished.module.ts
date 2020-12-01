import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedModule } from '../../../shared/shared.module';
import { FinishedPageRoutingModule } from './finished-routing.module';
import { FinishedPage } from './finished.page';

@NgModule({
  imports: [
    SharedModule,
    FinishedPageRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  declarations: [FinishedPage],
})
export class FinishedPageModule {}
