import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { defer, forkJoin, Observable } from 'rxjs';
import { concatMap, concatMapTo, map } from 'rxjs/operators';
import { PreferenceManager } from '../../preference-manager/preference-manager.service';
import { BASE_URL } from '../secret';

const { Device } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class DiaBackendAuthService {
  private readonly preferences = this.preferenceManager.getPreferences(
    DiaBackendAuthService.name
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly preferenceManager: PreferenceManager
  ) {}

  login$(email: string, password: string): Observable<LoginResult> {
    return this.httpClient
      .post<LoginResponse>(`${BASE_URL}/auth/token/login/`, {
        email,
        password,
      })
      .pipe(
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

  // TODO: Internally depend on PushNotificationService and remove parameters.
  createDevice$(fcmToken: string) {
    return defer(() =>
      forkJoin([this.getAuthHeaders(), Device.getInfo()])
    ).pipe(
      concatMap(([headers, deviceInfo]) =>
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

  hasLoggedIn$() {
    return this.preferences
      .getString$(PrefKeys.TOKEN)
      .pipe(map(token => token !== ''));
  }

  async hasLoggedIn() {
    const token = await this.preferences.getString(PrefKeys.TOKEN);
    return token !== '';
  }

  getUsername$() {
    return this.preferences.getString$(PrefKeys.USERNAME);
  }

  async getUsername() {
    return this.preferences.getString(PrefKeys.USERNAME);
  }

  private async setUsername(value: string) {
    return this.preferences.setString(PrefKeys.USERNAME, value);
  }

  getEmail$() {
    return this.preferences.getString$(PrefKeys.EMAIL);
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
    return this.preferences.getString(PrefKeys.TOKEN);
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
