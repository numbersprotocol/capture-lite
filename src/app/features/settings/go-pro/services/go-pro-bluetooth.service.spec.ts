import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { GoProBluetoothService } from './go-pro-bluetooth.service';

describe('GoProBluetoothService', () => {
  let service: GoProBluetoothService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(GoProBluetoothService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
