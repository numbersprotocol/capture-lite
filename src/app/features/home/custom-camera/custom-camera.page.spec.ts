import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { CustomCameraPage } from './custom-camera.page';

describe('CustomCameraPage', () => {
  let component: CustomCameraPage;
  let fixture: ComponentFixture<CustomCameraPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CustomCameraPage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(CustomCameraPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
