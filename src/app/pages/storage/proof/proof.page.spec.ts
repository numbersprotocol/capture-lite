import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
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
        MatListModule
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
