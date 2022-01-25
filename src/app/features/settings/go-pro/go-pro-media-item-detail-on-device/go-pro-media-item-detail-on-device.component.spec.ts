import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { GoProMediaItemDetailOnDeviceComponent } from './go-pro-media-item-detail-on-device.component';

describe('GoProMediaItemDetailOnDeviceComponent', () => {
  let component: GoProMediaItemDetailOnDeviceComponent;
  let fixture: ComponentFixture<GoProMediaItemDetailOnDeviceComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GoProMediaItemDetailOnDeviceComponent],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(GoProMediaItemDetailOnDeviceComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
