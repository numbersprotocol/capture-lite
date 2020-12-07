import { HttpClient } from '@angular/common/http';
import {} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { defer, EMPTY, of } from 'rxjs';
import { concatMapTo, tap } from 'rxjs/operators';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { BASE_URL } from '../secret';
import { DiaBackendAuthService } from './dia-backend-auth.service';

const sampleUsername = 'test';
const sampleEmail = 'test@test.com';
const samplePassword = 'testpassword';
const sampleToken = '0123-4567-89ab-cdef';

describe('DiaBackendAuthService', () => {
  let service: DiaBackendAuthService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    service = TestBed.inject(DiaBackendAuthService);
    httpClient = TestBed.inject(HttpClient);
    mockHttpClient(httpClient);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should not login after created', done => {
    service.hasLoggedIn$().subscribe(result => {
      expect(result).toBeFalse();
      done();
    });
  });

  it('should not have username after created', done => {
    service.getUsername$().subscribe(result => {
      expect(result).toBeFalsy();
      done();
    });
  });

  it('should not have email after created', done => {
    service.getEmail$().subscribe(result => {
      expect(result).toBeFalsy();
      done();
    });
  });

  it('should get username and email from result after logged in', done => {
    service
      .login$(sampleEmail, samplePassword)
      .pipe(
        tap(result => {
          expect(result.username).toBeTruthy();
          expect(result.email).toBeTruthy();
        })
      )
      .subscribe(done);
  });

  it('should get username after logged in', done => {
    service
      .login$(sampleEmail, samplePassword)
      .pipe(
        concatMapTo(defer(() => service.getUsername())),
        tap(username => expect(username).toBeTruthy())
      )
      .subscribe(done);
  });

  it('should get email after logged in', done => {
    service
      .login$(sampleEmail, samplePassword)
      .pipe(
        concatMapTo(defer(() => service.getEmail())),
        tap(email => expect(email).toBeTruthy())
      )
      .subscribe(done);
  });

  it('should indicate has-logged-in after logged in', done => {
    service
      .login$(sampleEmail, samplePassword)
      .pipe(
        concatMapTo(defer(() => service.hasLoggedIn())),
        tap(hasLoggedIn => expect(hasLoggedIn).toBeTrue())
      )
      .subscribe(done);
  });

  it('should clear email after logged out', done => {
    service
      .login$(sampleEmail, samplePassword)
      .pipe(
        concatMapTo(service.logout$()),
        concatMapTo(defer(() => service.getEmail())),
        tap(email => expect(email).toBeFalsy())
      )
      .subscribe(done);
  });

  it('should create user', done => {
    service
      .createUser$(sampleUsername, sampleEmail, samplePassword)
      .subscribe(result => {
        expect(result).toBeTruthy();
        done();
      });
  });
});

function mockHttpClient(httpClient: HttpClient) {
  spyOn(httpClient, 'post')
    .withArgs(`${BASE_URL}/auth/token/login/`, {
      email: sampleEmail,
      password: samplePassword,
    })
    .and.returnValue(of({ auth_token: sampleToken }))
    .withArgs(
      `${BASE_URL}/auth/token/logout/`,
      {},
      { headers: { authorization: `token ${sampleToken}` } }
    )
    .and.returnValue(of(EMPTY))
    .withArgs(`${BASE_URL}/auth/users/`, {
      username: sampleUsername,
      email: sampleEmail,
      password: samplePassword,
    })
    .and.returnValue(of(EMPTY));

  spyOn(httpClient, 'get')
    .withArgs(`${BASE_URL}/auth/users/me/`, {
      headers: { authorization: `token ${sampleToken}` },
    })
    .and.returnValue(of({ username: sampleUsername, email: sampleEmail }));
}
