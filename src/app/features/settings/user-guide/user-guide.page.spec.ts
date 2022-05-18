import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { JoyrideModule } from 'ngx-joyride';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { UserGuidePage } from './user-guide.page';

describe('UserGuidePage', () => {
  let component: UserGuidePage;
  let fixture: ComponentFixture<UserGuidePage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [UserGuidePage],
        imports: [SharedTestingModule, JoyrideModule.forChild()],
      }).compileComponents();

      fixture = TestBed.createComponent(UserGuidePage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
