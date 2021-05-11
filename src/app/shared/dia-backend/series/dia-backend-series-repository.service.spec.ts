import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { DiaBackendSeriesRepository } from './dia-backend-series-repository.service';

describe('DiaBackendSeriesRepository', () => {
  let service: DiaBackendSeriesRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendSeriesRepository);
  });

  it('should be created', () => expect(service).toBeTruthy());
});
