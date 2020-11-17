import { TestBed } from '@angular/core/testing';
import { Database } from './database.service';
import { MemoryTableImpl } from './table/memory-table-impl/memory-table-impl';
import { TABLE_IMPL } from './table/table';

describe('Database', () => {
  let service: Database;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TABLE_IMPL, useValue: MemoryTableImpl }
      ]
    });
    service = TestBed.inject(Database);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get new table with new ID', () => {
    const id = 'newId';
    expect(service.getTable(id)).toBeTruthy();
  });

  it('should get same table with same ID', () => {
    const id = 'id';
    expect(service.getTable(id)).toBe(service.getTable(id));
  });
});
