import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { ContactSelectionDialogComponent } from './contact-selection-dialog.component';

describe('ContactSelectionDialogComponent', () => {
  let component: ContactSelectionDialogComponent;
  let fixture: ComponentFixture<ContactSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContactSelectionDialogComponent],
      imports: [
        SharedTestingModule,
        MatDialogModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
