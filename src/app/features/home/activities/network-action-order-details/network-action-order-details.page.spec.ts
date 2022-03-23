import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { NetworkActionOrderDetailsPage } from './network-action-order-details.page';

describe('NetworkActionOrderDetailsPage', () => {
  let component: NetworkActionOrderDetailsPage;
  let fixture: ComponentFixture<NetworkActionOrderDetailsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [NetworkActionOrderDetailsPage],
        imports: [IonicModule.forRoot(), SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(NetworkActionOrderDetailsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
