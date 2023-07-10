import { TestBed } from '@angular/core/testing';

import { CaptureTabService } from './capture-tab.service';

describe('CaptureTabService', () => {
  let service: CaptureTabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaptureTabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
