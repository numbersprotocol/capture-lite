import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../shared-testing.module';
import { CaptureService } from './capture.service';

describe('CaptureService', () => {
  let service: CaptureService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(CaptureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
