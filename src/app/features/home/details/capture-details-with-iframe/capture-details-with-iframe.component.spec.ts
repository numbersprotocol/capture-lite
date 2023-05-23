import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CachedQueryJWTToken } from '../../../../shared/dia-backend/auth/dia-backend-auth.service';
import { BUBBLE_IFRAME_URL } from '../../../../shared/dia-backend/secret';
import { SharedModule } from '../../../../shared/shared.module';
import { CaptureDetailsWithIframeComponent } from './capture-details-with-iframe.component';

describe('CaptureDetailsWithIframeComponent', () => {
  let component: CaptureDetailsWithIframeComponent;
  let fixture: ComponentFixture<CaptureDetailsWithIframeComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CaptureDetailsWithIframeComponent],
        imports: [SharedModule],
      }).compileComponents();

      fixture = TestBed.createComponent(CaptureDetailsWithIframeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate iframe URL', () => {
    const testDetailedCaptureId = 'testId';
    const testToken: CachedQueryJWTToken = {
      access: 'testAccess',
      refresh: 'testRefresh',
      timestamp: Date.now(),
    };

    const expectedResult = component[
      'sanitizer'
    ].bypassSecurityTrustResourceUrl(
      `${BUBBLE_IFRAME_URL}/asset_page?nid=${testDetailedCaptureId}&token=${testToken.access}&refresh_token=${testToken.refresh}&from=mycapture`
    );

    const result = component['generateIframeUrl'](
      testDetailedCaptureId,
      testToken
    );

    expect(result).toEqual(expectedResult);
  });
});
