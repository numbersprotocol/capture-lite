import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { CapacitorStoragePreferences } from '../services/preference-manager/preferences/capacitor-storage-preferences/capacitor-storage-preferences';
import { PREFERENCES_IMPL } from '../services/preference-manager/preferences/preferences';
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
  providers: [
    { provide: PREFERENCES_IMPL, useValue: CapacitorStoragePreferences },
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
