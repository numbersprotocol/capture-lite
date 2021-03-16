import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { SeriesPage } from './series.page';

describe('SeriesPage', () => {
  let component: SeriesPage;
  let fixture: ComponentFixture<SeriesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SeriesPage],
      imports: [SharedTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
