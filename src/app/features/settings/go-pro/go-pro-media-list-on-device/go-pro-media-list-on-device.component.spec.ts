import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { GoProMediaListOnDeviceComponent } from './go-pro-media-list-on-device.component';

describe('GoProMediaListOnDeviceComponent', () => {
  let component: GoProMediaListOnDeviceComponent;
  let fixture: ComponentFixture<GoProMediaListOnDeviceComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GoProMediaListOnDeviceComponent],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(GoProMediaListOnDeviceComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
