import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { PrefetchingDialogComponent } from './prefetching-dialog.component';

describe('PrefetchingDialogComponent', () => {
  let component: PrefetchingDialogComponent;
  let fixture: ComponentFixture<PrefetchingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrefetchingDialogComponent],
      imports: [SharedTestingModule],
      providers: [{ provide: MatDialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(PrefetchingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
