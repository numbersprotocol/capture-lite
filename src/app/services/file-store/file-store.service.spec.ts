import { TestBed } from '@angular/core/testing';
import { FileStore } from './file-store.service';

describe('FileStore', () => {
  let service: FileStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileStore);
  });

  it('should be created', () => expect(service).toBeTruthy());
});
