import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { PrivacyPageRoutingModule } from './privacy-routing.module';
import { PrivacyPage } from './privacy.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PrivacyPageRoutingModule,
    TranslocoModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSlideToggleModule
  ],
  declarations: [PrivacyPage]
})
export class PrivacyPageModule { }
