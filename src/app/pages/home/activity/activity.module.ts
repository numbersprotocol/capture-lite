import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedModule } from '../../../shared/shared.module';
import { ActivityPageRoutingModule } from './activity-routing.module';
import { ActivityPage } from './activity.page';

@NgModule({
  imports: [
    SharedModule,
    ActivityPageRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
  ],
  declarations: [ActivityPage],
})
export class ActivityPageModule {}
