import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoProMediaListOnDeviceComponent } from './go-pro-media-list-on-device.component';

describe('GoProMediaListOnDeviceComponent', () => {
  let component: GoProMediaListOnDeviceComponent;
  let fixture: ComponentFixture<GoProMediaListOnDeviceComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GoProMediaListOnDeviceComponent],
        imports: [IonicModule.forRoot()],
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
