import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { PhoneVerificationPage } from './phone-verification.page';

describe('PhoneVerificationPage', () => {
  let component: PhoneVerificationPage;
  let fixture: ComponentFixture<PhoneVerificationPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PhoneVerificationPage],
        imports: [
          SharedTestingModule,
          FormlyModule.forChild(),
          FormlyMaterialModule,
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(PhoneVerificationPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
