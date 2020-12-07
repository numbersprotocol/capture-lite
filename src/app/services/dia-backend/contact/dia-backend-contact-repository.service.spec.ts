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

  it('should get all local cache first then via HTTP request', done => {
    // tslint:disable-next-line: no-console
    repository.getAll$().subscribe(result => console.log(result));
  });

  it('should invite new contact', done => {
    const inviteEmail = 'invite@test.com';
    // tslint:disable-next-line: no-console
    repository.invite$(inviteEmail).subscribe(result => console.log(result));
  });
});

const EMAIL = 'sean@numbersprotocol.io';
const PASSWORD = 'testpassword';
