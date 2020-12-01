import { TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../transloco/transloco-root-testing.module';
import { PublishersAlert } from './publishers-alert.service';

describe('PublishersAlert', () => {
  let service: PublishersAlert;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule()],
    });
    service = TestBed.inject(PublishersAlert);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
