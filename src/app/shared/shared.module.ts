import { NgModule } from '@angular/core';
import { CapacitorFilesystemTableImpl } from '../services/database/table/capacitor-filesystem-table-impl/capacitor-filesystem-table-impl';
import { TABLE_IMPL } from '../services/database/table/table';
import { CapacitorStoragePreferencesImpl } from '../services/preference-manager/preferences/capacitor-storage-preferences-impl/capacitor-storage-preferences-impl';
import { PREFERENCES_IMPL } from '../services/preference-manager/preferences/preferences';

@NgModule({
  providers: [
    {
      provide: TABLE_IMPL,
      useValue: CapacitorFilesystemTableImpl,
    },
    {
      provide: PREFERENCES_IMPL,
      useValue: CapacitorStoragePreferencesImpl,
    },
  ],
})
export class SharedModule {}
