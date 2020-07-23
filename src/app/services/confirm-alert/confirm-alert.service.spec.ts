import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmAlert } from './confirm-alert.service';

describe('ConfirmAlert', () => {
  let service: ConfirmAlert;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    });
    service = TestBed.inject(ConfirmAlert);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
