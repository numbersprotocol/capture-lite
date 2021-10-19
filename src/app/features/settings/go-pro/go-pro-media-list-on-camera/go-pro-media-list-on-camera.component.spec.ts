import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoProMediaListOnCameraComponent } from './go-pro-media-list-on-camera.component';

describe('GoProMediaListOnCameraComponent', () => {
  let component: GoProMediaListOnCameraComponent;
  let fixture: ComponentFixture<GoProMediaListOnCameraComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GoProMediaListOnCameraComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(GoProMediaListOnCameraComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
