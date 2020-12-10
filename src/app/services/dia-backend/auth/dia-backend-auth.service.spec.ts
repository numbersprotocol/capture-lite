import { HttpClient } from '@angular/common/http';
import {} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { defer, EMPTY, of } from 'rxjs';
import { concatMapTo, tap } from 'rxjs/operators';
import { SharedTestingModule } from '../../../shared/shared-testing.module';
import { BASE_URL } from '../secret';
import { DiaBackendAuthService } from './dia-backend-auth.service';

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
      .login$(EMAIL, PASSWORD)
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
      .login$(EMAIL, PASSWORD)
      .pipe(
        concatMapTo(defer(() => service.getUsername())),
        tap(username => expect(username).toBeTruthy())
      )
      .subscribe(done);
  });

  it('should get email after logged in', done => {
    service
      .login$(EMAIL, PASSWORD)
      .pipe(
        concatMapTo(defer(() => service.getEmail())),
        tap(email => expect(email).toBeTruthy())
      )
      .subscribe(done);
  });

  it('should indicate has-logged-in after logged in', done => {
    service
      .login$(EMAIL, PASSWORD)
      .pipe(
        concatMapTo(defer(() => service.hasLoggedIn())),
        tap(hasLoggedIn => expect(hasLoggedIn).toBeTrue())
      )
      .subscribe(done);
  });

  it('should clear email after logged out', done => {
    service
      .login$(EMAIL, PASSWORD)
      .pipe(
        concatMapTo(service.logout$()),
        concatMapTo(defer(() => service.getEmail())),
        tap(email => expect(email).toBeFalsy())
      )
      .subscribe(done);
  });

  it('should create user', done => {
    service.createUser$(USERNAME, EMAIL, PASSWORD).subscribe(result => {
      expect(result).toBeTruthy();
      done();
    });
  });
});

function mockHttpClient(httpClient: HttpClient) {
  spyOn(httpClient, 'post')
    .withArgs(`${BASE_URL}/auth/token/login/`, {
      email: EMAIL,
      password: PASSWORD,
    })
    .and.returnValue(of({ auth_token: TOKEN }))
    .withArgs(
      `${BASE_URL}/auth/token/logout/`,
      {},
      { headers: { authorization: `token ${TOKEN}` } }
    )
    .and.returnValue(of(EMPTY))
    .withArgs(`${BASE_URL}/auth/users/`, {
      username: USERNAME,
      email: EMAIL,
      password: PASSWORD,
    })
    .and.returnValue(of(EMPTY));

  spyOn(httpClient, 'get')
    .withArgs(`${BASE_URL}/auth/users/me/`, {
      headers: { authorization: `token ${TOKEN}` },
    })
    .and.returnValue(of({ username: USERNAME, email: EMAIL }));
}

const USERNAME = 'test';
const EMAIL = 'test@test.com';
const PASSWORD = 'testpassword';
const TOKEN = '0123-4567-89ab-cdef';
