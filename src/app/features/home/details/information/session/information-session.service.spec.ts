import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../../shared/shared-testing.module';
import { InformationSessionService } from './information-session.service';

describe('InformationSessionService', () => {
  let service: InformationSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SharedTestingModule] });
    service = TestBed.inject(InformationSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
