import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditCaptionPageRoutingModule } from './edit-caption-routing.module';

import { EditCaptionPage } from './edit-caption.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditCaptionPageRoutingModule,
  ],
  declarations: [EditCaptionPage],
})
export class EditCaptionPageModule {}
