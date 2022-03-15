import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IonicModule } from '@ionic/angular';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { TransferLoadingComponent } from './transfer-loading.component';

describe('TransferLoadingComponent', () => {
  let component: TransferLoadingComponent;
  let fixture: ComponentFixture<TransferLoadingComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TransferLoadingComponent],
        imports: [IonicModule.forRoot(), SharedTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: {} },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TransferLoadingComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
