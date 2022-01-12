import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { DiaBackendStoreService } from './dia-backend-store.service';

describe('DiaBackendStoreService', () => {
  let service: DiaBackendStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
