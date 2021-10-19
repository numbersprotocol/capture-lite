import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoProMediaListItemOnCameraComponent } from './go-pro-media-list-item-on-camera.component';

describe('GoProMediaListItemOnCameraComponent', () => {
  let component: GoProMediaListItemOnCameraComponent;
  let fixture: ComponentFixture<GoProMediaListItemOnCameraComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GoProMediaListItemOnCameraComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(GoProMediaListItemOnCameraComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
