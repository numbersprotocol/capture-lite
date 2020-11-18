import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { ProofRepository } from './proof-repository.service';

describe('ProofRepository', () => {
  let service: ProofRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule
      ]
    });
    service = TestBed.inject(ProofRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
