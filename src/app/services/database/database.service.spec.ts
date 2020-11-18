import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { Database } from './database.service';

describe('Database', () => {
  let service: Database;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule
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
