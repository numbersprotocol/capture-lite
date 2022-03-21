import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { NetworkActionOrdersComponent } from './network-action-orders.component';

describe('NetworkActionOrdersComponent', () => {
  let component: NetworkActionOrdersComponent;
  let fixture: ComponentFixture<NetworkActionOrdersComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [NetworkActionOrdersComponent],
        imports: [IonicModule.forRoot(), SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(NetworkActionOrdersComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
