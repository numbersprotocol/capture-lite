import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared/shared-testing.module';

import { DataPolicyPage } from './data-policy.page';

describe('DataPolicyPage', () => {
  let component: DataPolicyPage;
  let fixture: ComponentFixture<DataPolicyPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DataPolicyPage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(DataPolicyPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
