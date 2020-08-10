import { TestBed } from '@angular/core/testing';
import { getTranslocoModule } from 'src/app/transloco/transloco-root.module.spec';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule()]
    });
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
