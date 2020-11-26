import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { InformationPageRoutingModule } from './information-routing.module';
import { InformationPage } from './information.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    InformationPageRoutingModule,
    TranslocoModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
  ],
  declarations: [InformationPage],
})
export class InformationPageModule {}
