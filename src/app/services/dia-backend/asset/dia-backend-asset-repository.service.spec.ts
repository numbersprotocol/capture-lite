import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { DiaBackendAssetRepository } from './dia-backend-asset-repository.service';

describe('DiaBackendAssetRepository', () => {
  let service: DiaBackendAssetRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendAssetRepository);
  });

  it('should be created', () => expect(service).toBeTruthy());
});
