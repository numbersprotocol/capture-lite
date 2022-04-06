import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { ActivitiesPage } from './activities.page';

describe('ActivitiesPage', () => {
  let component: ActivitiesPage;
  let fixture: ComponentFixture<ActivitiesPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ActivitiesPage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(ActivitiesPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => expect(component).toBeTruthy());
});
