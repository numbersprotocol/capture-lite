import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { PrefetchingPage } from './prefetching.page';

describe('PrefetchingPage', () => {
  let component: PrefetchingPage;
  let fixture: ComponentFixture<PrefetchingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrefetchingPage],
      imports: [SharedTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PrefetchingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
