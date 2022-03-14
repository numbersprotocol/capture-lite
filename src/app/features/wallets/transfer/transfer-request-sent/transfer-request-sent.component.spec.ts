import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IonicModule } from '@ionic/angular';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { TransferRequestSentComponent } from './transfer-request-sent.component';

describe('TransferRequestSentComponent', () => {
  let component: TransferRequestSentComponent;
  let fixture: ComponentFixture<TransferRequestSentComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TransferRequestSentComponent],
        imports: [IonicModule.forRoot(), SharedTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: {} },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TransferRequestSentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
