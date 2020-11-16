import { TestBed } from '@angular/core/testing';
import { IgnoredTransactionRepository } from './ignored-transaction-repository.service';

describe('IgnoredTransactionRepository', () => {
  let service: IgnoredTransactionRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IgnoredTransactionRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
