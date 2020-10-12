import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { AboutPageRoutingModule } from './about-routing.module';
import { AboutPage } from './about.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AboutPageRoutingModule,
    TranslocoModule
  ],
  declarations: [AboutPage]
})
export class AboutPageModule { }
