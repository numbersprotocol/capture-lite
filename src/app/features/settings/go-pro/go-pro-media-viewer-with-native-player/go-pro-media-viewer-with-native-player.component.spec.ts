import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { GoProMediaViewerWithNativePlayerComponent } from './go-pro-media-viewer-with-native-player.component';

describe('GoProMediaViewerWithNativePlayerComponent', () => {
  let component: GoProMediaViewerWithNativePlayerComponent;
  let fixture: ComponentFixture<GoProMediaViewerWithNativePlayerComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GoProMediaViewerWithNativePlayerComponent],
        imports: [IonicModule.forRoot(), SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(
        GoProMediaViewerWithNativePlayerComponent
      );
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
