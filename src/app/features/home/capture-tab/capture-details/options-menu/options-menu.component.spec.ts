import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { SharedTestingModule } from '../../../../../shared/shared-testing.module';
import { OptionsMenuComponent } from './options-menu.component';

describe('OptionsMenuComponent', () => {
  let component: OptionsMenuComponent;
  let fixture: ComponentFixture<OptionsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OptionsMenuComponent],
      imports: [SharedTestingModule],
      providers: [
        { provide: MatBottomSheetRef, useValue: {} },
        {
          provide: MAT_BOTTOM_SHEET_DATA,
          useValue: {
            proof: { diaBackendAssetId: '', indexedAssets: { hashValue: {} } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
