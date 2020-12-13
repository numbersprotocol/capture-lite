import { TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { DiaBackendContactRepository } from './dia-backend-contact-repository.service';

xdescribe('DiaBackendContactRepository', () => {
  let repository: DiaBackendContactRepository;
  let authService: DiaBackendAuthService;

  beforeEach(done => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
    });
    repository = TestBed.inject(DiaBackendContactRepository);
    authService = TestBed.inject(DiaBackendAuthService);
    authService.login$(EMAIL, PASSWORD).subscribe(done);
  });

  afterEach(done => authService.logout$().subscribe(done));

  it('should be created', () => expect(repository).toBeTruthy());

  // TODO
  it('should get all local cache first then via HTTP request');
});

const EMAIL = 'test@test.com';
const PASSWORD = 'testpassword';
