import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { TransactionDetailsPage } from './transaction-details.page';

describe('TransactionDetailsPage', () => {
  let component: TransactionDetailsPage;
  let fixture: ComponentFixture<TransactionDetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionDetailsPage],
      imports: [SharedTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
