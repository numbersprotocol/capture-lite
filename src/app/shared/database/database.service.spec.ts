import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../shared-testing.module';
import { Database } from './database.service';

describe('Database', () => {
  let database: Database;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    database = TestBed.inject(Database);
  });

  it('should be created', () => expect(database).toBeTruthy());

  it('should get new table with new ID', () => {
    const id = 'newId';
    expect(database.getTable(id)).toBeTruthy();
  });

  it('should get same table with same ID', () => {
    const id = 'id';
    expect(database.getTable(id)).toBe(database.getTable(id));
  });

  it('should clear all tables', async () => {
    const id = 'id';
    const table = database.getTable(id);
    await table.insert([{ a: 1 }]);

    await database.clear();

    expect(await table.queryAll()).toEqual([]);
  });
});
