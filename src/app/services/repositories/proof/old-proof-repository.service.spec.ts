import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { OldProofRepository } from './old-proof-repository.service';

describe('OldProofRepository', () => {
  let service: OldProofRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule
      ]
    });
    service = TestBed.inject(OldProofRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
