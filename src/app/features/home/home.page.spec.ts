import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { CaptureTabComponent } from './capture-tab/capture-tab.component';
import { UploadingBarComponent } from './capture-tab/uploading-bar/uploading-bar.component';
import { HomePage } from './home.page';
import { PostCaptureTabComponent } from './post-capture-tab/post-capture-tab.component';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          HomePage,
          CaptureTabComponent,
          PostCaptureTabComponent,
          UploadingBarComponent,
        ],
        imports: [SharedTestingModule],
      }).compileComponents();

      const router = TestBed.inject(Router);
      spyOn(router, 'navigate').and.resolveTo(true);

      fixture = TestBed.createComponent(HomePage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => expect(component).toBeTruthy());
});
