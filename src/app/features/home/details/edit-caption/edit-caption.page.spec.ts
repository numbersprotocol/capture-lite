import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';

import { EditCaptionPage } from './edit-caption.page';

describe('EditCaptionPage', () => {
  let component: EditCaptionPage;
  let fixture: ComponentFixture<EditCaptionPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EditCaptionPage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(EditCaptionPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
