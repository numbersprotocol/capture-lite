import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { DiaBackendTransactionRepository } from './dia-backend-transaction-repository.service';

describe('DiaBackendTransactionRepository', () => {
  let service: DiaBackendTransactionRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendTransactionRepository);
  });

  it('should be created', () => expect(service).toBeTruthy());
});
