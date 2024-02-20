import { TestBed, waitForAsync } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { SharedTestingModule } from '../shared-testing.module';

import { AFEvent } from 'appsflyer-capacitor-plugin';
import { CCamCustomEventType } from './apps-flyer-enums';
import { AppsFlyerService } from './apps-flyer.service';

describe('AppsFlyerService', () => {
  let service: AppsFlyerService;
  let platformIs: (platformName: string) => boolean;
  let platformReadySpy: Promise<void>;
  let platformSpy: Platform;

  beforeEach(
    waitForAsync(async () => {
      platformReadySpy = Promise.resolve();
      platformIs = _ => false;

      platformSpy = jasmine.createSpyObj('Platform', {
        ready: platformReadySpy,
        is: platformIs,
      });

      await TestBed.configureTestingModule({
        imports: [SharedTestingModule],
        providers: [{ provide: Platform, useValue: platformSpy }],
      }).compileComponents();

      service = TestBed.inject(AppsFlyerService);
    })
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log camera shutter event through Appsflyer.logEvent method', async () => {
    const expectedEvent: AFEvent = {
      eventName: CCamCustomEventType.CCAM_TRY_CLICK_CAMERA_SHUTTER,
    };
    // NOTE: We're accessing a private method here for testing purposes only.
    // TypeScript doesn't enforce private/protected visibility at runtime, only at compile time.
    // This is generally not recommended as it can lead to fragile tests and breaks encapsulation.
    // However, in this case, we need to ensure that the private method 'logEvent' is called with
    // the correct parameters.
    const logEventSpy = spyOn(service as any, 'logEvent');

    await service.logCameraShutterEvent();

    expect(logEventSpy).toHaveBeenCalledWith(expectedEvent);
    expect(logEventSpy).toHaveBeenCalledTimes(1);
  });
});
