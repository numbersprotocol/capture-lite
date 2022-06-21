import { TestBed } from '@angular/core/testing';
import { InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { SharedModule } from '../shared.module';

import { InAppStoreService } from './in-app-store.service';

describe('InAppStoreService', () => {
  let service: InAppStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [InAppPurchase2],
    });
    service = TestBed.inject(InAppStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
