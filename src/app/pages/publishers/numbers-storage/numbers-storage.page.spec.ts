import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { NumbersStoragePage } from './numbers-storage.page';

describe('NumbersStoragePage', () => {
  let component: NumbersStoragePage;
  let fixture: ComponentFixture<NumbersStoragePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NumbersStoragePage],
      imports: [IonicModule.forRoot(), RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(NumbersStoragePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
