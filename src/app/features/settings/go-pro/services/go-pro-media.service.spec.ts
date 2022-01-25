import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { GoProMediaService } from './go-pro-media.service';

describe('GoProMediaService', () => {
  let service: GoProMediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(GoProMediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
