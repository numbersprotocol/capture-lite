import { TestBed, waitForAsync } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { SharedTestingModule } from '../shared-testing.module';
import { AppFlyerService } from './app-flyer.service';

describe('AppFlyerService', () => {
  let service: AppFlyerService;
  let platformIs: boolean | undefined;
  let platformReadySpy: Promise<void>;
  let platformSpy: Platform;

  beforeEach(
    waitForAsync(async () => {
      platformReadySpy = Promise.resolve();
      platformIs = false;

      platformSpy = jasmine.createSpyObj('Platform', {
        ready: platformReadySpy,
        is: platformIs,
      });

      await TestBed.configureTestingModule({
        imports: [SharedTestingModule],
        providers: [{ provide: Platform, useValue: platformSpy }],
      }).compileComponents();

      service = TestBed.inject(AppFlyerService);
    })
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
