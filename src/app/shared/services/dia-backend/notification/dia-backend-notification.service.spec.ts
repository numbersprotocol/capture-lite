import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { DiaBackendNotificationService } from './dia-backend-notification.service';

describe('DiaBackendNotificationService', () => {
  let service: DiaBackendNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendNotificationService);
  });

  it('should be created', () => expect(service).toBeTruthy());
});
