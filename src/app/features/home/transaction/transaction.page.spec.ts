import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { TransactionPage } from './transaction.page';

describe('TransactionPage', () => {
  let component: TransactionPage;
  let fixture: ComponentFixture<TransactionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionPage],
      imports: [SharedTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => expect(component).toBeTruthy());
});
