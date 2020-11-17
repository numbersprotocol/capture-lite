import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { CollectorService } from './collector.service';

describe('CollectorService', () => {
  let service: CollectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule,
        getTranslocoModule()
      ]
    });
    service = TestBed.inject(CollectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
