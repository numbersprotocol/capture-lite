import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { AssetRepository } from './asset-repository.service';

describe('AssetRepository', () => {
  let service: AssetRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule,
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(AssetRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
