import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedTestingModule } from '../../shared-testing.module';
import { OnboardingPopUpDialogComponent } from './onboarding-pop-up-dialog.component';

describe('OnboardingPopUpDialogComponent', () => {
  let component: OnboardingPopUpDialogComponent;
  let fixture: ComponentFixture<OnboardingPopUpDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OnboardingPopUpDialogComponent],
        imports: [SharedTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: {} },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(OnboardingPopUpDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
