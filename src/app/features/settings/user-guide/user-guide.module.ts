import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { UserGuidePageRoutingModule } from './user-guide-routing.module';
import { UserGuidePage } from './user-guide.page';

@NgModule({
  imports: [SharedModule, UserGuidePageRoutingModule],
  declarations: [UserGuidePage],
})
export class UserGuidePageModule {}
