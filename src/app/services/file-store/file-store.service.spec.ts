import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { FileStore } from './file-store.service';

describe('FileStore', () => {
  let service: FileStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(FileStore);
  });

  it('should be created', () => expect(service).toBeTruthy());
});
