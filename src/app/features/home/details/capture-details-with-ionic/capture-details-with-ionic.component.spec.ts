import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatePipe } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { CaptureDetailsWithIonicComponent } from './capture-details-with-ionic.component';

describe('CaptureDetailsWithIonicComponent', () => {
  let component: CaptureDetailsWithIonicComponent;
  let fixture: ComponentFixture<CaptureDetailsWithIonicComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CaptureDetailsWithIonicComponent],
        imports: [SharedModule],
        providers: [DatePipe],
      }).compileComponents();

      fixture = TestBed.createComponent(CaptureDetailsWithIonicComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
