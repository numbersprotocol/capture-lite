import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { IgnoredTransactionRepository } from './ignored-transaction-repository.service';

describe('IgnoredTransactionRepository', () => {
  let service: IgnoredTransactionRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule
      ]
    });
    service = TestBed.inject(IgnoredTransactionRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
