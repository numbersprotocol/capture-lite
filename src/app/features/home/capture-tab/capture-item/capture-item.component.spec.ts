import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { CaptureItemComponent } from './capture-item.component';

describe('CaptureItemComponent', () => {
  let component: CaptureItemComponent;
  let fixture: ComponentFixture<CaptureItemComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CaptureItemComponent],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(CaptureItemComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
