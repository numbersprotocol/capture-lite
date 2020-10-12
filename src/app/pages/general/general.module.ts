import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { GeneralPageRoutingModule } from './general-routing.module';
import { GeneralPage } from './general.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GeneralPageRoutingModule,
    TranslocoModule
  ],
  declarations: [GeneralPage]
})
export class GeneralPageModule { }
