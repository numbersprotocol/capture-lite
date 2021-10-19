import { TestBed } from '@angular/core/testing';

import { GoProMediaService } from './go-pro-media.service';

describe('GoProMediaService', () => {
  let service: GoProMediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoProMediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
