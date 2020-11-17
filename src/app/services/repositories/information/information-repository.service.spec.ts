import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { InformationRepository } from './information-repository.service';

describe('InformationRepository', () => {
  let service: InformationRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule
      ]
    });
    service = TestBed.inject(InformationRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
