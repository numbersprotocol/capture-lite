import { NgModule } from '@angular/core';
import { CapacitorFilesystemTableImpl } from '../services/database/table/capacitor-filesystem-table-impl/capacitor-filesystem-table-impl';
import { TABLE_IMPL } from '../services/database/table/table';

@NgModule({
  providers: [
    { provide: TABLE_IMPL, useValue: CapacitorFilesystemTableImpl }
  ]
})
export class SharedModule { }
