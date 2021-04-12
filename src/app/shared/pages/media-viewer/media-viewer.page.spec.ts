import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PinchZoomModule } from 'ngx-pinch-zoom';
import { SharedTestingModule } from '../../shared-testing.module';
import { MediaViewerPage } from './media-viewer.page';

describe('MediaViewerPage', () => {
  let component: MediaViewerPage;
  let fixture: ComponentFixture<MediaViewerPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MediaViewerPage],
        imports: [SharedTestingModule, PinchZoomModule],
      }).compileComponents();

      fixture = TestBed.createComponent(MediaViewerPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
