import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { DiaBackendWalletService } from './dia-backend-wallet.service';

describe('DiaBackendWalletService', () => {
  let service: DiaBackendWalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendWalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
