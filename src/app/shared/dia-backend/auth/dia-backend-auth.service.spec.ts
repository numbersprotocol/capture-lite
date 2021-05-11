import {} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { DiaBackendAuthService } from './dia-backend-auth.service';

describe('DiaBackendAuthService', () => {
  let service: DiaBackendAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendAuthService);
  });

  it('should be created', () => expect(service).toBeTruthy());
});
