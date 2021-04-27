import { TestBed } from '@angular/core/testing';

import { ErrorReportService } from './error-report.service';

describe('ErrorReportService', () => {
  let service: ErrorReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
