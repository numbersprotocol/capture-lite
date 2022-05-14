import { TestBed } from '@angular/core/testing';

import { UserGuideService } from './user-guide.service';

describe('UserGuideService', () => {
  let service: UserGuideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserGuideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
