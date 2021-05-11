import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared-testing.module';
import { DiaBackendAssetDownloadingService } from './dia-backend-downloading.service';

describe('DiaBackendDownloadingService', () => {
  let service: DiaBackendAssetDownloadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(DiaBackendAssetDownloadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
