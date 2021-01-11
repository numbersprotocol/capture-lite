import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CaptureTabComponent } from './capture-tab.component';

describe('CaptureTabComponent', () => {
  let component: CaptureTabComponent;
  let fixture: ComponentFixture<CaptureTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CaptureTabComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(CaptureTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
