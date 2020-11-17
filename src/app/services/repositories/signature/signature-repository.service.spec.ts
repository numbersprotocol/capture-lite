import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { SignatureRepository } from './signature-repository.service';

describe('SignatureRepository', () => {
  let service: SignatureRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule
      ]
    });
    service = TestBed.inject(SignatureRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
