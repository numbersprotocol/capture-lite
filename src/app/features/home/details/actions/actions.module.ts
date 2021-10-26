import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { ActionsPageRoutingModule } from './actions-routing.module';
import { ActionsPage } from './actions.page';

@NgModule({
  imports: [SharedModule, ActionsPageRoutingModule],
  declarations: [ActionsPage],
})
export class ActionsPageModule {}
