import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../shared-testing.module';

import { IframeService } from './iframe.service';

describe('IframeService', () => {
  let service: IframeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(IframeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
