import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared-testing.module';
import { DiaBackendAsseRefreshingService } from './dia-backend-asset-refreshing.service';

describe('DiaBackendAssetUploadingService', () => {
  let service: DiaBackendAsseRefreshingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendAsseRefreshingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
