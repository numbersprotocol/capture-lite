import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PublishersAlert } from './publishers-alert.service';

describe('PublishersAlert', () => {
  let service: PublishersAlert;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    });
    service = TestBed.inject(PublishersAlert);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
