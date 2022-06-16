import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { DiaBackendService } from './dia-backend-service.service';

describe('DiaBackendService', () => {
  let service: DiaBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
