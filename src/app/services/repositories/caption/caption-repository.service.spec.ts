import { TestBed } from '@angular/core/testing';
import { CaptionRepository } from './caption-repository.service';

describe('CaptionRepository', () => {
  let service: CaptionRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaptionRepository);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
