import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { PostCaptureDetailsPage } from './post-capture-details.page';

describe('PostCaptureDetailsPage', () => {
  let component: PostCaptureDetailsPage;
  let fixture: ComponentFixture<PostCaptureDetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostCaptureDetailsPage],
      imports: [SharedTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCaptureDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
