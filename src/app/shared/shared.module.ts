import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { CapacitorPluginsModule } from './core/capacitor-plugins/capacitor-plugins.module';
import { MaterialModule } from './core/material/material.module';
import { MigratingDialogComponent } from './core/migrating-dialog/migrating-dialog.component';
import { SeriesCardComponent } from './core/series-card/series-card.component';

const declarations = [MigratingDialogComponent, SeriesCardComponent];

const imports = [
  CommonModule,
  IonicModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  TranslocoModule,
  MaterialModule,
  CapacitorPluginsModule,
];

@NgModule({
  declarations,
  imports,
  exports: [...declarations, ...imports],
})
export class SharedModule {}
