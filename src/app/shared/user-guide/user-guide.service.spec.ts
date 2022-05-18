import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../shared-testing.module';
import { UserGuideService } from './user-guide.service';

describe('UserGuideService', () => {
  let service: UserGuideService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(UserGuideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
