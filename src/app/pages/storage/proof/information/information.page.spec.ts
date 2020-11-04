import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { InformationPage } from './information.page';

describe('InformationPage', () => {
  let component: InformationPage;
  let fixture: ComponentFixture<InformationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InformationPage],
      imports: [IonicModule.forRoot(), RouterTestingModule, getTranslocoModule()]
    }).compileComponents();

    fixture = TestBed.createComponent(InformationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
