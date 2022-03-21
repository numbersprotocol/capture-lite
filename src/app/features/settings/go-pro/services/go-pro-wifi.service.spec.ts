import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { GoProWifiService } from './go-pro-wifi.service';

describe('GoProWifiService', () => {
  let service: GoProWifiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(GoProWifiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
