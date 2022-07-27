import { TestBed, waitForAsync } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { CustomCameraService } from './custom-camera.service';

describe('CustomCameraService', () => {
  let service: CustomCameraService;
  let platformReadySpy: Promise<void>;
  let platformIsSpy: boolean | undefined;
  let platformSpy: Platform;

  beforeEach(
    waitForAsync(() => {
      platformReadySpy = Promise.resolve();
      platformIsSpy = false;
      platformSpy = jasmine.createSpyObj('Platform', {
        ready: platformReadySpy,
        is: platformIsSpy,
      });

      TestBed.configureTestingModule({
        imports: [SharedTestingModule],
        providers: [{ provide: Platform, useValue: platformSpy }],
      }).compileComponents();
      service = TestBed.inject(CustomCameraService);
    })
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
