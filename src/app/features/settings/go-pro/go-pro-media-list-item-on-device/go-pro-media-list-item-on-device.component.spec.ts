import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoProMediaListItemOnDeviceComponent } from './go-pro-media-list-item-on-device.component';

describe('GoProMediaListItemOnDeviceComponent', () => {
  let component: GoProMediaListItemOnDeviceComponent;
  let fixture: ComponentFixture<GoProMediaListItemOnDeviceComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GoProMediaListItemOnDeviceComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(GoProMediaListItemOnDeviceComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
