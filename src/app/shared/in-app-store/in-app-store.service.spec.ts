import { TestBed } from '@angular/core/testing';
import { SharedModule } from '../shared.module';

import { InAppStoreService } from './in-app-store.service';

describe('InAppStoreService', () => {
  let service: InAppStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
    });
    service = TestBed.inject(InAppStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
