import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

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
