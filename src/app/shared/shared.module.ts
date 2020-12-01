import { NgModule } from '@angular/core';
import { CapacitorFilesystemTable } from '../services/database/table/capacitor-filesystem-table/capacitor-filesystem-table';
import { TABLE_IMPL } from '../services/database/table/table';
import { CapacitorStoragePreferences } from '../services/preference-manager/preferences/capacitor-storage-preferences/capacitor-storage-preferences';
import { PREFERENCES_IMPL } from '../services/preference-manager/preferences/preferences';

@NgModule({
  providers: [
    {
      provide: TABLE_IMPL,
      useValue: CapacitorFilesystemTable,
    },
    {
      provide: PREFERENCES_IMPL,
      useValue: CapacitorStoragePreferences,
    },
  ],
})
export class SharedModule {}
