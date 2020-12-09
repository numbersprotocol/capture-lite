import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [SharedTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  // TODO: Enable this test after we remove the ugly WORKAROUND in ngOnInit().
  // it('should create', () => expect(component).toBeTruthy());
});
