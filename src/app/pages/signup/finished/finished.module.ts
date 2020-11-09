import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { FinishedPageRoutingModule } from './finished-routing.module';
import { FinishedPage } from './finished.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FinishedPageRoutingModule,
    TranslocoModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule
  ],
  declarations: [FinishedPage]
})
export class FinishedPageModule { }
