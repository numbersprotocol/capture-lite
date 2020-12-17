import { NgModule } from '@angular/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { TutorialPageRoutingModule } from './tutorial-routing.module';
import { TutorialPage } from './tutorial.page';

@NgModule({
  imports: [TutorialPageRoutingModule, FormlyMaterialModule],
  declarations: [TutorialPage],
})
export class TutorialPageModule {}
