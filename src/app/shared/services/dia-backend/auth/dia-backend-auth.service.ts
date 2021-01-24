import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { isEqual, reject } from 'lodash';
import { combineLatest, defer, forkJoin, Observable } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  filter,
  map,
  timeout,
} from 'rxjs/operators';
import { LanguageService } from '../../language/language.service';
import { PreferenceManager } from '../../preference-manager/preference-manager.service';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import { BASE_URL } from '../secret';

const { Device, Storage } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class DiaBackendAuthService {
  private readonly preferences = this.preferenceManager.getPreferences(
    DiaBackendAuthService.name
  );
  private readonly loginTimeout = 20000;

  readonly hasLoggedIn$ = this.preferences
    .getString$(PrefKeys.TOKEN)
    .pipe(map(token => token !== ''));

  readonly getUsername$ = this.preferences.getString$(PrefKeys.USERNAME);

  readonly getEmail$ = this.preferences.getString$(PrefKeys.EMAIL);

  private readonly getToken$ = this.preferences
    .getString$(PrefKeys.TOKEN)
    .pipe(filter(token => token.length !== 0));

  readonly getAuthHeaders$ = this.getToken$.pipe(
    map(token => ({ authorization: `token ${token}` }))
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly languageService: LanguageService,
    private readonly preferenceManager: PreferenceManager,
    private readonly pushNotificationService: PushNotificationService
  ) {}

  initialize$() {
    return this.getAuthHeaders$.pipe(
      concatMap(headers =>
        combineLatest([
          this.updateDevice$(headers),
          this.updateLanguage$(headers),
        ])
      )
    );
  }

  login$(email: string, password: string): Observable<LoginResult> {
    return this.httpClient
      .post<LoginResponse>(`${BASE_URL}/auth/token/login/`, {
        email,
        password,
      })
      .pipe(
        timeout(this.loginTimeout),
        concatMap(response => this.setToken(response.auth_token)),
        concatMapTo(this.readUser$()),
        concatMap(response =>
          forkJoin([
            this.setUsername(response.username),
            this.setEmail(response.email),
          ])
        ),
        map(([username, _email]) => ({ username, email: _email }))
      );
  }

  private readUser$() {
    return defer(() => this.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.get<ReadUserResponse>(`${BASE_URL}/auth/users/me/`, {
          headers,
        })
      )
    );
  }

  logout$() {
    return defer(() => this.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post(`${BASE_URL}/auth/token/logout/`, {}, { headers })
      ),
      concatMapTo(
        defer(() =>
          Promise.all([
            this.setToken(''),
            this.setEmail(''),
            this.setUsername(''),
          ])
        )
      )
    );
  }

  createUser$(username: string, email: string, password: string) {
    return this.httpClient.post<CreateUserResponse>(`${BASE_URL}/auth/users/`, {
      username,
      email,
      password,
    });
  }

  resendActivationEmail(email: string) {
    return this.httpClient.post(`${BASE_URL}/auth/users/resend_activation/`, {
      email,
    });
  }

  updateLanguage$(headers: { [header: string]: string | string[] }) {
    return this.languageService.currentLanguageKey$.pipe(
      distinctUntilChanged(isEqual),
      concatMap(language =>
        this.httpClient.patch(
          `${BASE_URL}/auth/users/me/`,
          { language },
          { headers }
        )
      )
    );
  }

  private updateDevice$(headers: { [header: string]: string | string[] }) {
    return combineLatest([
      this.pushNotificationService.getToken$(),
      defer(() => Device.getInfo()),
    ]).pipe(
      concatMap(([fcmToken, deviceInfo]) =>
        this.httpClient.post(
          `${BASE_URL}/auth/devices/`,
          {
            fcm_token: fcmToken,
            platform: deviceInfo.platform,
            device_identifier: deviceInfo.uuid,
          },
          { headers }
        )
      )
    );
  }

  async hasLoggedIn() {
    const token = await this.preferences.getString(PrefKeys.TOKEN);
    return !!token;
  }

  async getUsername() {
    return this.preferences.getString(PrefKeys.USERNAME);
  }

  private async setUsername(value: string) {
    return this.preferences.setString(PrefKeys.USERNAME, value);
  }

  async getEmail() {
    return this.preferences.getString(PrefKeys.EMAIL);
  }

  private async setEmail(value: string) {
    return this.preferences.setString(PrefKeys.EMAIL, value);
  }

  async getAuthHeaders() {
    return { authorization: `token ${await this.getToken()}` };
  }

  private async getToken() {
    return new Promise<string>(resolve => {
      this.preferences.getString(PrefKeys.TOKEN).then(token => {
        if (token.length !== 0) {
          resolve(token);
        } else {
          reject(new Error('Cannot get DIA backend token which is empty.'));
        }
      });
    });
  }

  private async setToken(value: string) {
    return this.preferences.setString(PrefKeys.TOKEN, value);
  }
}

const enum PrefKeys {
  TOKEN = 'TOKEN',
  USERNAME = 'USERNAME',
  EMAIL = 'EMAIL',
}

interface LoginResult {
  readonly username: string;
  readonly email: string;
}

export interface LoginResponse {
  readonly auth_token: string;
}

export interface ReadUserResponse {
  readonly username: string;
  readonly email: string;
}

// tslint:disable-next-line: no-empty-interface
interface CreateUserResponse {}
