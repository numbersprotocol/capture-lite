import { TestBed } from '@angular/core/testing';
import { AssetRepository } from './asset-repository.service';

describe('AssetRepository', () => {
  let service: AssetRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssetRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
