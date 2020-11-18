import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from 'src/app/shared/shared-testing.module';
import { CaptionRepository } from './caption-repository.service';

describe('CaptionRepository', () => {
  let service: CaptionRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedTestingModule
      ]
    });
    service = TestBed.inject(CaptionRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
