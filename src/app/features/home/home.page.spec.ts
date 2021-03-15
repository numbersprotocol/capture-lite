import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SeriesCardComponent } from '../../shared/core/series-card/series-card.component';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { CaptureTabComponent } from './capture-tab/capture-tab.component';
import { UploadingBarComponent } from './capture-tab/uploading-bar/uploading-bar.component';
import { HomePage } from './home.page';
import { PostCaptureTabComponent } from './post-capture-tab/post-capture-tab.component';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HomePage,
        CaptureTabComponent,
        PostCaptureTabComponent,
        UploadingBarComponent,
        SeriesCardComponent,
      ],
      imports: [SharedTestingModule],
    }).compileComponents();

    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => expect(component).toBeTruthy());
});
