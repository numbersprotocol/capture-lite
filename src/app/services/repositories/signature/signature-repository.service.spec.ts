import { TestBed } from '@angular/core/testing';
import { SignatureRepository } from './signature-repository.service';

describe('SignatureRepository', () => {
  let service: SignatureRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignatureRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
