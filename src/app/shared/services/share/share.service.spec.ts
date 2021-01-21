import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { ShareService } from './share.service';

describe('ShareService', () => {
  let service: ShareService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(ShareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
