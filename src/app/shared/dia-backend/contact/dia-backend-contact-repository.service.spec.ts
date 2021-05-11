import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { DiaBackendContactRepository } from './dia-backend-contact-repository.service';

describe('DiaBackendContactRepository', () => {
  let repository: DiaBackendContactRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    repository = TestBed.inject(DiaBackendContactRepository);
  });

  it('should be created', () => expect(repository).toBeTruthy());
});
