import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { UploadBarComponent } from './upload-bar.component';

describe('UploadBarComponent', () => {
  let component: UploadBarComponent;
  let fixture: ComponentFixture<UploadBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UploadBarComponent],
      imports: [SharedTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
