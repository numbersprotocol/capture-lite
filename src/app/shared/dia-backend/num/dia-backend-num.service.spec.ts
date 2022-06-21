import { TestBed } from '@angular/core/testing';
import { SharedModule } from '../../shared.module';

import { DiaBackendNumService } from './dia-backend-num.service';

describe('DiaBackendNumService', () => {
  let service: DiaBackendNumService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedModule] });
    service = TestBed.inject(DiaBackendNumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
