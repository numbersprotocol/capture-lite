import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { SerializationService } from './serialization.service';

describe('SerializationService', () => {
  let service: SerializationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule
      ]
    });
    service = TestBed.inject(SerializationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
