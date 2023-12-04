import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';

import { BuyNumPage } from './buy-num.page';

describe('BuyNumPage', () => {
  let component: BuyNumPage;
  let fixture: ComponentFixture<BuyNumPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [BuyNumPage],
        imports: [SharedTestingModule],
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
