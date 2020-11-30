import { NgModule } from '@angular/core';
import { MemoryTableImpl } from '../services/database/table/memory-table-impl/memory-table-impl';
import { TABLE_IMPL } from '../services/database/table/table';
import { MemoryPreferencesImpl } from '../services/preference-manager/preferences/memory-preferences-impl/memory-preferences-impl';
import { PREFERENCES_IMPL } from '../services/preference-manager/preferences/preferences';

@NgModule({
  providers: [
    {
      provide: TABLE_IMPL,
      useValue: MemoryTableImpl,
    },
    {
      provide: PREFERENCES_IMPL,
      useValue: MemoryPreferencesImpl,
    },
  ],
})
export class SharedTestingModule {}
