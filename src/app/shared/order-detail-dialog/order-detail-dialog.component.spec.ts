import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { OrderDetailDialogComponent } from './order-detail-dialog.component';

describe('ActionsDialogComponent', () => {
  let component: OrderDetailDialogComponent;
  let fixture: ComponentFixture<OrderDetailDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OrderDetailDialogComponent],
        imports: [SharedTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: {} },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(OrderDetailDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
