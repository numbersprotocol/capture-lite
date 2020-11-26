import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { IonicModule } from '@ionic/angular';
import { OptionsMenuComponent } from './options-menu.component';

describe('OptionsMenuComponent', () => {
  let component: OptionsMenuComponent;
  let fixture: ComponentFixture<OptionsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OptionsMenuComponent],
      imports: [IonicModule.forRoot(), MatBottomSheetModule, MatListModule],
      providers: [{ provide: MatBottomSheetRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
