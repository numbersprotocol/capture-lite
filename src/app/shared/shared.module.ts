import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { CapacitorPluginsModule } from './capacitor-plugins/capacitor-plugins.module';
import { MaterialModule } from './material/material.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslocoModule,
    MaterialModule,
    CapacitorPluginsModule,
  ],
  exports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    MaterialModule,
  ],
})
export class SharedModule {}
