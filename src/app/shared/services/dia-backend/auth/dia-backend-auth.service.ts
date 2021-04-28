import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { isEqual, reject } from 'lodash-es';
import { combineLatest, defer, forkJoin, Observable, Subject } from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  filter,
  map,
  pluck,
  repeatWhen,
  tap,
} from 'rxjs/operators';
import { isNonNullable } from '../../../../utils/rx-operators/rx-operators';
import { LanguageService } from '../../language/language.service';
import { PreferenceManager } from '../../preference-manager/preference-manager.service';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import { BASE_URL, TRUSTED_CLIENT_KEY } from '../secret';

const { Device, Storage } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class DiaBackendAuthService {
  private readonly preferences = this.preferenceManager.getPreferences(
    'DiaBackendAuthService'
  );

  readonly hasLoggedIn$ = this.preferences
    .getString$(PrefKeys.TOKEN)
    .pipe(map(token => token !== ''));

  readonly username$ = this.preferences.getString$(PrefKeys.USERNAME);

  readonly email$ = this.preferences.getString$(PrefKeys.EMAIL);

  readonly token$ = this.preferences
    .getString$(PrefKeys.TOKEN)
    .pipe(filter(token => token.length !== 0));

  readonly authHeaders$ = this.token$.pipe(
    map(token => ({ authorization: `token ${token}` }))
  );

  private readonly refreshAvatar$ = new Subject<string>();

  readonly avatar$ = defer(() => this.getAuthHeaders()).pipe(
    concatMap(headers =>
      this.httpClient.get<GetAvatarResponse>(
        `${BASE_URL}/auth/users/profile/`,
        { headers }
      )
    ),
    pluck('profile_picture_thumbnail'),
    isNonNullable(),
    repeatWhen(() => this.refreshAvatar$)
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly languageService: LanguageService,
    private readonly preferenceManager: PreferenceManager,
    private readonly pushNotificationService: PushNotificationService
  ) {}

  // TODO: remove this method
  private async migrate() {
    const oldToken = await Storage.get({
      key: 'numbersStoragePublisher_authToken',
    });
    if (oldToken.value) {
      const splitted = oldToken.value.split(' ');
      if (splitted[0] === 'token' && splitted[1]) {
        this.setToken(splitted[1]);
      }
    }

    const oldUsername = await Storage.get({
      key: 'numbersStoragePublisher_userName',
    });
    if (oldUsername.value) {
      this.setUsername(oldUsername.value);
    }

    const oldEmail = await Storage.get({
      key: 'numbersStoragePublisher_email',
    });
    if (oldEmail.value) {
      this.setEmail(oldEmail.value);
    }
  }

  initialize$() {
    return this.authHeaders$.pipe(
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

  createUser$(username: string, email: string, password: string) {
    return this.httpClient.post<CreateUserResponse>(
      `${BASE_URL}/auth/users/`,
      {
        username,
        email,
        password,
      },
      { headers: { 'x-api-key': TRUSTED_CLIENT_KEY } }
    );
  }

  resendActivationEmail$(email: string) {
    return this.httpClient.post<ResendActivationEmailResponse>(
      `${BASE_URL}/auth/users/resend_activation/`,
      {
        email,
      }
    );
  }

  resetPassword$(email: string) {
    return this.httpClient.post<ResetPasswordResponse>(
      `${BASE_URL}/auth/users/reset_password/`,
      {
        email,
      }
    );
  }

  private updateLanguage$(headers: { [header: string]: string | string[] }) {
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

  updateUser$({ username }: { username: string }) {
    return defer(() => this.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.patch<UpdateUserResponse>(
          `${BASE_URL}/auth/users/me/`,
          { username },
          { headers }
        )
      ),
      concatMapTo(this.readUser$()),
      concatMap(response =>
        forkJoin([
          this.setUsername(response.username),
          this.setEmail(response.email),
        ])
      )
    );
  }

  uploadAvatar$({ picture }: { picture: File }) {
    const formData = new FormData();
    formData.append('profile_picture', picture);
    return defer(() => this.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.patch<UploadAvatarResponse>(
          `${BASE_URL}/auth/users/profile/`,
          formData,
          {
            headers,
          }
        )
      ),
      pluck('profile_picture_thumbnail'),
      tap(url => this.refreshAvatar$.next(url))
    );
  }

  async hasLoggedIn() {
    await this.migrate();
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CreateUserResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UpdateUserResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ResendActivationEmailResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ResetPasswordResponse {}

type GetAvatarResponse = UploadAvatarResponse;

interface UploadAvatarResponse {
  readonly profile_picture_thumbnail?: string;
}
