import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { TutorialPageRoutingModule } from './tutorial-routing.module';
import { TutorialPage } from './tutorial.page';

@NgModule({
  imports: [TutorialPageRoutingModule, SharedModule],
  declarations: [TutorialPage],
})
export class TutorialPageModule {}
