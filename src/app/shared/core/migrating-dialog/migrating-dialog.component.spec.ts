import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedTestingModule } from '../../shared-testing.module';
import { MigratingDialogComponent } from './migrating-dialog.component';

describe('MigratingDialogComponent', () => {
  let component: MigratingDialogComponent;
  let fixture: ComponentFixture<MigratingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MigratingDialogComponent],
      imports: [SharedTestingModule],
      providers: [{ provide: MatDialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(MigratingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
