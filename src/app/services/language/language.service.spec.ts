import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { getTranslocoModule } from '../../transloco/transloco-root.module.spec';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule, getTranslocoModule()],
    });
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
