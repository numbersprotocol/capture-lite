import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { CustomCameraService } from './custom-camera.service';

describe('CustomCameraService', () => {
  let service: CustomCameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(CustomCameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
