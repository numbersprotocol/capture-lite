import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared-testing.module';
import { DiaBackendAssetUploadingService } from './dia-backend-asset-uploading.service';

describe('DiaBackendAssetUploadingService', () => {
  let service: DiaBackendAssetUploadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendAssetUploadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
