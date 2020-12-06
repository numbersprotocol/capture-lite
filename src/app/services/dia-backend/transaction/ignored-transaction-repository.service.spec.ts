import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { IgnoredTransactionRepository } from './ignored-transaction-repository.service';

describe('IgnoredTransactionRepository', () => {
  let repository: IgnoredTransactionRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    repository = TestBed.inject(IgnoredTransactionRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });
});
