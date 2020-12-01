import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../../shared/shared-testing.module';
import { AssetRepository } from './asset-repository.service';

describe('AssetRepository', () => {
  let service: AssetRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(AssetRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
