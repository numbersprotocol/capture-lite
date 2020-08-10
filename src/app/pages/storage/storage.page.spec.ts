import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { StoragePage } from './storage.page';

describe('StoragePage', () => {
  let component: StoragePage;
  let fixture: ComponentFixture<StoragePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StoragePage],
      imports: [IonicModule.forRoot(), RouterTestingModule, getTranslocoModule()]
    }).compileComponents();

    fixture = TestBed.createComponent(StoragePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
