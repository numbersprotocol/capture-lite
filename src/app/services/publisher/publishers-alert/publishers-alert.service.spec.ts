import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { PublishersAlert } from './publishers-alert.service';

describe('PublishersAlert', () => {
  let service: PublishersAlert;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(PublishersAlert);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
