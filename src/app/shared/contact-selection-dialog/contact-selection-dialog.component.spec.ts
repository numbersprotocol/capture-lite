import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedTestingModule } from '../shared-testing.module';
import { ContactSelectionDialogComponent } from './contact-selection-dialog.component';

describe('ContactSelectionDialogComponent', () => {
  let component: ContactSelectionDialogComponent;
  let fixture: ComponentFixture<ContactSelectionDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ContactSelectionDialogComponent],
        imports: [SharedTestingModule],
        providers: [
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: {} },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ContactSelectionDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
