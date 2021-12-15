import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { DiaBackendWorkflowService } from './dia-backend-workflow.service';

describe('DiaBackendWorkflowService', () => {
  let service: DiaBackendWorkflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendWorkflowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
