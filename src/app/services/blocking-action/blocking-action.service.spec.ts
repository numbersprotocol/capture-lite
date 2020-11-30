import { TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../transloco/transloco-root.module.spec';
import { BlockingActionService } from './blocking-action.service';

describe('BlockingActionService', () => {
  let service: BlockingActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule()],
    });
    service = TestBed.inject(BlockingActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
