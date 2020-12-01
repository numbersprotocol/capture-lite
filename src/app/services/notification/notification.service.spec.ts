import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should create notification', () =>
    expect(service.createNotification()).toBeTruthy());

  it('should notify', () => expect(service.notify('', '')).toBeTruthy());

  it('should error', () => expect(service.error(new Error())).toBeTruthy());
});
