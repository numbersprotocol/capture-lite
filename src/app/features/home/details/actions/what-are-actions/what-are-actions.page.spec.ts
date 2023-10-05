import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SharedTestingModule } from '../../../../../shared/shared-testing.module';
import { WhatAreActionsPage } from './what-are-actions.page';

describe('WhatAreActionsPage', () => {
  let component: WhatAreActionsPage;
  let fixture: ComponentFixture<WhatAreActionsPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [WhatAreActionsPage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(WhatAreActionsPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
