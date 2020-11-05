import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { HistoryPageRoutingModule } from './history-routing.module';
import { HistoryPage } from './history.page';







@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HistoryPageRoutingModule,
    IonicModule,
    TranslocoModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatGridListModule,
    MatChipsModule
  ],
  declarations: [HistoryPage]
})
export class HistoryPageModule { }
