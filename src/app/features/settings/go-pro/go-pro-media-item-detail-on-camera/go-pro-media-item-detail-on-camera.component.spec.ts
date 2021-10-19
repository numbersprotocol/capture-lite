import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoProMediaItemDetailOnCameraComponent } from './go-pro-media-item-detail-on-camera.component';

describe('GoProMediaItemDetailOnCameraComponent', () => {
  let component: GoProMediaItemDetailOnCameraComponent;
  let fixture: ComponentFixture<GoProMediaItemDetailOnCameraComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GoProMediaItemDetailOnCameraComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(GoProMediaItemDetailOnCameraComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
