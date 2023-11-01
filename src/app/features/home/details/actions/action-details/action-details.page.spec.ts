import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SharedTestingModule } from '../../../../../shared/shared-testing.module';
import { ActionDetailsPage } from './action-details.page';

describe('ActionDetailsPage', () => {
  let component: ActionDetailsPage;
  let fixture: ComponentFixture<ActionDetailsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ActionDetailsPage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(ActionDetailsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
