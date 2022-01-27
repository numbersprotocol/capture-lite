import { TestBed } from '@angular/core/testing';

import { GoProWifiService } from './go-pro-wifi.service';

describe('GoProWifiService', () => {
  let service: GoProWifiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoProWifiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
