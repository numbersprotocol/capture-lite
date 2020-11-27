import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { CapacitorFactsProvider } from './capacitor-facts-provider.service';

describe('CapacitorFactsProvider', () => {
  let service: CapacitorFactsProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(CapacitorFactsProvider);
  });

  it('should be created', () => expect(service).toBeTruthy());
});
