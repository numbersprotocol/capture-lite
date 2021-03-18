import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared-testing.module';
import { DiaBackendDownloadingService } from './dia-backend-downloading.service';

describe('DiaBackendDownloadingService', () => {
  let service: DiaBackendDownloadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(DiaBackendDownloadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
