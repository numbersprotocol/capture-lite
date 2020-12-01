import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedModule } from '../../../../shared/shared.module';
import { InformationPageRoutingModule } from './information-routing.module';
import { InformationPage } from './information.page';

@NgModule({
  imports: [
    SharedModule,
    InformationPageRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSnackBarModule,
  ],
  declarations: [InformationPage],
})
export class InformationPageModule {}
