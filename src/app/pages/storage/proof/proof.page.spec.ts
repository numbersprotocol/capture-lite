import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { ProofPage } from './proof.page';

describe('ProofPage', () => {
  let component: ProofPage;
  let fixture: ComponentFixture<ProofPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProofPage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        getTranslocoModule(),
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatIconTestingModule,
        MatListModule,
        MatSnackBarModule,
        MatDialogModule,
        MatBottomSheetModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProofPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
