import { TestBed } from '@angular/core/testing';

import { AndroidBackButtonService } from './android-back-button.service';

describe('AndroidBackButtonService', () => {
  let service: AndroidBackButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AndroidBackButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
