import { TestBed } from '@angular/core/testing';
import { ProofRepository } from './proof-repository.service';

describe('ProofRepository', () => {
  let service: ProofRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProofRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
