import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared-testing.module';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should get current language key', async () => {
    const expected = 'es-mx';
    await service.initialize();
    await service.setCurrentLanguage(expected);
    expect(await service.getCurrentLanguageKey()).toEqual(expected);
  });
});
