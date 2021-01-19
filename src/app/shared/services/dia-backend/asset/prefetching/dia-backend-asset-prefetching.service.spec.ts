import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared-testing.module';
import { DiaBackendAssetPrefetchingService } from './dia-backend-asset-prefetching.service';

describe('DiaBackendAssetPrefetchingService', () => {
  let service: DiaBackendAssetPrefetchingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(DiaBackendAssetPrefetchingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
