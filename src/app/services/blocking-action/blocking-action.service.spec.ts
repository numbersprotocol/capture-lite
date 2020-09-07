import { TestBed } from '@angular/core/testing';

import { BlockingActionService } from './blocking-action.service';

describe('BlockingActionService', () => {
  let service: BlockingActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlockingActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
