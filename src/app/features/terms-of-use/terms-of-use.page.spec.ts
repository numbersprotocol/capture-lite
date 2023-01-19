import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared/shared-testing.module';

import { TermsOfUsePage } from './terms-of-use.page';

describe('TermsOfUsePage', () => {
  let component: TermsOfUsePage;
  let fixture: ComponentFixture<TermsOfUsePage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TermsOfUsePage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(TermsOfUsePage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
