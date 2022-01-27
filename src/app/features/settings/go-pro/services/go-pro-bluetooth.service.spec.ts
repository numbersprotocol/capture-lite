import { TestBed } from '@angular/core/testing';

import { GoProBluetoothService } from './go-pro-bluetooth.service';

describe('GoProBluetoothService', () => {
  let service: GoProBluetoothService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoProBluetoothService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
