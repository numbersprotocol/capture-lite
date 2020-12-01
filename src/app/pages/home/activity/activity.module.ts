import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ActivityPageRoutingModule } from './activity-routing.module';
import { ActivityPage } from './activity.page';

@NgModule({
  imports: [SharedModule, ActivityPageRoutingModule],
  declarations: [ActivityPage],
})
export class ActivityPageModule {}
