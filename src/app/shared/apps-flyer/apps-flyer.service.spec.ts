import { TestBed, waitForAsync } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { SharedTestingModule } from '../shared-testing.module';

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
});
