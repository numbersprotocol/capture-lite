import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { getTranslocoModule } from 'src/app/transloco-module.spec';
import { ProofPage } from './proof.page';

describe('ProofPage', () => {
  let component: ProofPage;
  let fixture: ComponentFixture<ProofPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProofPage],
      imports: [IonicModule.forRoot(), RouterTestingModule, getTranslocoModule()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProofPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
