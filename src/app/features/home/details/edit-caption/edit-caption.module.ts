import { NgModule } from '@angular/core';

import { EditCaptionPageRoutingModule } from './edit-caption-routing.module';

import { SharedModule } from '../../../../shared/shared.module';
import { EditCaptionPage } from './edit-caption.page';

@NgModule({
  imports: [SharedModule, EditCaptionPageRoutingModule],
  declarations: [EditCaptionPage],
})
export class EditCaptionPageModule {}
