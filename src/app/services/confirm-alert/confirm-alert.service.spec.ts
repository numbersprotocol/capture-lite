import { TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../transloco/transloco-root.module.spec';
import { ConfirmAlert } from './confirm-alert.service';

describe('ConfirmAlert', () => {
  let service: ConfirmAlert;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule()],
    });
    service = TestBed.inject(ConfirmAlert);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
