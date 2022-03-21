import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { WalletsPage } from '../wallets.page';
import { TransferPage } from './transfer.page';

describe('TransferPage', () => {
  let component: TransferPage;
  let fixture: ComponentFixture<TransferPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TransferPage],
        imports: [
          IonicModule.forRoot(),
          SharedTestingModule,
          RouterTestingModule.withRoutes([
            { path: 'wallets', component: WalletsPage },
          ]),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TransferPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
