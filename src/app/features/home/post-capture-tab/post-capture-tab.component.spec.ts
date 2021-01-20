import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { PostCaptureTabComponent } from './post-capture-tab.component';

describe('PostCaptureTabComponent', () => {
  let component: PostCaptureTabComponent;
  let fixture: ComponentFixture<PostCaptureTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostCaptureTabComponent],
      imports: [SharedTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PostCaptureTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
