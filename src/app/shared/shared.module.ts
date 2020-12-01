import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { CapacitorFilesystemTable } from '../services/database/table/capacitor-filesystem-table/capacitor-filesystem-table';
import { TABLE_IMPL } from '../services/database/table/table';
import { CapacitorStoragePreferences } from '../services/preference-manager/preferences/capacitor-storage-preferences/capacitor-storage-preferences';
import { PREFERENCES_IMPL } from '../services/preference-manager/preferences/preferences';
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
  ],
  providers: [
    { provide: TABLE_IMPL, useValue: CapacitorFilesystemTable },
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
