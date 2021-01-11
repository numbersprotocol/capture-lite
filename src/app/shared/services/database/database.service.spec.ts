import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
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
});
