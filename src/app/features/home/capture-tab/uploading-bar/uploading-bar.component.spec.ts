import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { UploadingBarComponent } from './uploading-bar.component';

describe('UploadingBarComponent', () => {
  let component: UploadingBarComponent;
  let fixture: ComponentFixture<UploadingBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UploadingBarComponent],
      imports: [SharedTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
