import { NgModule } from '@angular/core';
import { MemoryTableImpl } from '../services/database/table/memory-table-impl/memory-table-impl';
import { TABLE_IMPL } from '../services/database/table/table';

@NgModule({
  providers: [
    { provide: TABLE_IMPL, useValue: MemoryTableImpl }
  ]
})
export class SharedTestingModule { }
