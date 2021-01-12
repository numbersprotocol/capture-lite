import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { CaptureDetailsPage } from './capture-details.page';

describe('CaptureDetailsPage', () => {
  let component: CaptureDetailsPage;
  let fixture: ComponentFixture<CaptureDetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CaptureDetailsPage],
      imports: [SharedTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CaptureDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
