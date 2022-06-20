import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { SharedTestingModule } from '../../../shared/shared-testing.module';

import { BuyNumPage } from './buy-num.page';

describe('BuyNumPage', () => {
  let component: BuyNumPage;
  let fixture: ComponentFixture<BuyNumPage>;

  beforeEach(
    waitForAsync(() => {
      const iap2SpyMethods = ['error', 'ready', 'when', 'refresh', 'off'];
      const inAppPurchase2Spy = jasmine.createSpyObj(
        'InAppPurchase2',
        iap2SpyMethods
      );

      TestBed.configureTestingModule({
        declarations: [BuyNumPage],
        imports: [SharedTestingModule],
        providers: [{ provide: InAppPurchase2, useValue: inAppPurchase2Spy }],
      }).compileComponents();

      fixture = TestBed.createComponent(BuyNumPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
