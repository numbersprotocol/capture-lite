import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { TransactionPage } from './activities.page';

describe('TransactionPage', () => {
  let component: TransactionPage;
  let fixture: ComponentFixture<TransactionPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TransactionPage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(TransactionPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => expect(component).toBeTruthy());
});
