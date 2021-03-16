import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { SafePipeModule } from 'safe-pipe';
import { CapacitorPluginsModule } from './core/capacitor-plugins/capacitor-plugins.module';
import { MaterialModule } from './core/material/material.module';
import { MigratingDialogComponent } from './core/migrating-dialog/migrating-dialog.component';

@NgModule({
  declarations: [MigratingDialogComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SafePipeModule,
    TranslocoModule,
    MaterialModule,
    CapacitorPluginsModule,
  ],
  exports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    SafePipeModule,
    TranslocoModule,
    MaterialModule,
  ],
})
export class SharedModule {}
