import { TestBed } from '@angular/core/testing';
import { SerializationService } from './serialization.service';

describe('SerializationService', () => {
  let service: SerializationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SerializationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
