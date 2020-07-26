import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CollectorService } from './collector.service';

describe('CollectorService', () => {
  let service: CollectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()]
    });
    service = TestBed.inject(CollectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
