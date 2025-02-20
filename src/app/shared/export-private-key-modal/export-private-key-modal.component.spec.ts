import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { ExportPrivateKeyModalComponent } from './export-private-key-modal.component';

describe('ExportPrivateKeyModalComponent', () => {
  let component: ExportPrivateKeyModalComponent;
  let fixture: ComponentFixture<ExportPrivateKeyModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ExportPrivateKeyModalComponent],
        imports: [SharedTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: {} },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ExportPrivateKeyModalComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
