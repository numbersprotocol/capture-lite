import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { CaptureClubPage } from './capture-club.page';

describe('CaptureClubPage', () => {
  let component: CaptureClubPage;
  let fixture: ComponentFixture<CaptureClubPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CaptureClubPage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(CaptureClubPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
