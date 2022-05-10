import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { InvitationPage } from './invitation.page';

describe('InvitationPage', () => {
  let component: InvitationPage;
  let fixture: ComponentFixture<InvitationPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [InvitationPage],
        imports: [IonicModule.forRoot(), SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(InvitationPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
