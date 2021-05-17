import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { SendingPostCapturePage } from './sending-post-capture.page';

describe('SendingPostCapturePage', () => {
  let component: SendingPostCapturePage;
  let fixture: ComponentFixture<SendingPostCapturePage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SendingPostCapturePage],
        imports: [SharedTestingModule],
      }).compileComponents();

      fixture = TestBed.createComponent(SendingPostCapturePage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
