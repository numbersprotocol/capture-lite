import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';

import { MediaRebrandedComponent } from './media-rebranded.component';

describe('MediaRebrandedComponent', () => {
  let component: MediaRebrandedComponent;
  let fixture: ComponentFixture<MediaRebrandedComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MediaRebrandedComponent],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(MediaRebrandedComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
