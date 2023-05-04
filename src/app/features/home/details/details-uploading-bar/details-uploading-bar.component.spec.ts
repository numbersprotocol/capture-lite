import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { DetailsUploadingBarComponent } from './details-uploading-bar.component';

describe('DetailsUploadingBarComponent', () => {
  let component: DetailsUploadingBarComponent;
  let fixture: ComponentFixture<DetailsUploadingBarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DetailsUploadingBarComponent],
        imports: [SharedModule],
      }).compileComponents();

      fixture = TestBed.createComponent(DetailsUploadingBarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
