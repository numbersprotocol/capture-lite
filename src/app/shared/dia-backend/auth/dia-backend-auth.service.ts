import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { isEqual, reject } from 'lodash-es';
import {
  Observable,
  ReplaySubject,
  combineLatest,
  defer,
  forkJoin,
  of,
} from 'rxjs';
import {
  concatMap,
  concatMapTo,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { secondSince } from '../../../utils/date';
import { LanguageService } from '../../language/service/language.service';
import { PreferenceManager } from '../../preference-manager/preference-manager.service';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import {
  BASE_URL,
  PIPEDREAM_DELETE_CAPTURE_ACCOUNT,
  TRUSTED_CLIENT_KEY,
} from '../secret';

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

  readonly profileName$ = this.preferences.getString$(PrefKeys.PROFILE_NAME);

  readonly email$ = this.preferences.getString$(PrefKeys.EMAIL);

  readonly token$ = this.preferences
    .getString$(PrefKeys.TOKEN)
    .pipe(filter(token => token.length !== 0));

  readonly authHeaders$ = this.token$.pipe(
    map(token => ({ authorization: `token ${token}` }))
  );

  readonly profile$ = new ReplaySubject<ReadProfileResponse>(1);

  readonly emailVerified$ = this.preferences.getBoolean$(
    PrefKeys.EMAIL_VERIFIED
  );

  readonly points$ = this.preferences.getNumber$(PrefKeys.POINTS);

  readonly referralCode$ = this.preferences.getString$(PrefKeys.REFERRAL_CODE);

  readonly cachedQueryJWTToken$ = defer(() =>
    this.getCachedQueryJWTToken()
  ).pipe(
    switchMap(cachedToken => {
      if (cachedToken === undefined || this.isJWTTokenExpired(cachedToken)) {
        return this.queryJWTTokenWithCaching$();
      }
      return of(cachedToken);
    })
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly languageService: LanguageService,
    private readonly preferenceManager: PreferenceManager,
    private readonly pushNotificationService: PushNotificationService
  ) {}

  // TODO: remove this method
  private async migrate() {
    const oldToken = await Preferences.get({
      key: 'numbersStoragePublisher_authToken',
    });
    if (oldToken.value) {
      const splitted = oldToken.value.split(' ');
      if (splitted[0] === 'token' && splitted[1]) {
        this.setToken(splitted[1]);
      }
    }

    const oldUsername = await Preferences.get({
      key: 'numbersStoragePublisher_userName',
    });
    if (oldUsername.value) {
      this.setUsername(oldUsername.value);
    }

    const oldEmail = await Preferences.get({
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
        concatMapTo(this.syncUser$()),
        map(([username, _email]) => ({ username, email: _email }))
      );
  }

  queryJWTToken$() {
    return defer(() => this.getAuthHeaders()).pipe(
      concatMap(headers => {
        return this.httpClient.post<QueryJWTTokenResponse>(
          `${BASE_URL}/api/v3/auth/qjwt/`,
          {},
          { headers }
        );
      })
    );
  }

  queryJWTTokenWithCaching$() {
    return this.queryJWTToken$().pipe(
      map(queryJWTTokenResponse => {
        const cachedQueryJWTToken: CachedQueryJWTToken = {
          ...queryJWTTokenResponse,
          timestamp: Date.now(),
        };
        this.setCachedQueryJWTToken(cachedQueryJWTToken);
        return cachedQueryJWTToken;
      })
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

  createUser$(
    username: string,
    email: string,
    password: string,
    referralCodeOptional: string,
    device?: UserDevice
  ) {
    const requestBody: Partial<SignUpRequestBody> = {
      username,
      email,
      password,
      referral_code: referralCodeOptional,
      device,
    };
    if (referralCodeOptional === '') delete requestBody.referral_code;

    return this.httpClient.post<CreateUserResponse>(
      `${BASE_URL}/auth/users/`,
      requestBody,
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

  readDevice$() {
    return combineLatest([
      this.pushNotificationService.getToken$(),
      defer(() => Device.getInfo()),
      defer(() => Device.getId()),
    ]);
  }

  private updateDevice$(headers: { [header: string]: string | string[] }) {
    return combineLatest([
      this.pushNotificationService.getToken$(),
      defer(() => Device.getInfo()),
      defer(() => Device.getId()),
    ]).pipe(
      concatMap(([fcmToken, deviceInfo, deviceId]) =>
        this.httpClient.post(
          `${BASE_URL}/auth/devices/`,
          {
            fcm_token: fcmToken,
            platform: deviceInfo.platform,
            device_identifier: deviceId.identifier,
          },
          { headers }
        )
      )
    );
  }

  updateProfile$({
    profileName,
    description,
    profilePicture,
    profileBackground,
  }: {
    profileName: string;
    description: string;
    profilePicture?: File;
    profileBackground?: File;
  }) {
    const formData = new FormData();
    formData.append('display_name', profileName);
    formData.append('description', description);
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    }
    if (profileBackground) {
      formData.append('profile_background', profileBackground);
    }
    return defer(() => this.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.patch<UpdateProfileResponse>(
          `${BASE_URL}/auth/users/profile/`,
          formData,
          { headers }
        )
      ),
      tap(response => {
        this.profile$.next(response);
        this.setProfileName(response.display_name);
      })
    );
  }

  deleteAccount$(email: string) {
    return defer(() => this.getAuthHeaders()).pipe(
      concatMap(authHeaders => {
        const body = { email };
        return this.httpClient.post<any>(
          `${PIPEDREAM_DELETE_CAPTURE_ACCOUNT}`,
          body,
          {
            headers: new HttpHeaders()
              .set('Authorization', `${authHeaders.authorization}`)
              .set('Content-Type', 'application/json'),
          }
        );
      })
    );
  }

  uploadAvatar$({ picture }: { picture: File }) {
    const formData = new FormData();
    formData.append('profile_picture', picture);
    return defer(() => this.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.patch<UpdateProfileResponse>(
          `${BASE_URL}/auth/users/profile/`,
          formData,
          {
            headers,
          }
        )
      ),
      tap(profile => this.profile$.next(profile))
    );
  }

  sendPhoneVerification$(phoneNumber: string) {
    return defer(() => this.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post<SendPhoneVerificationResponse>(
          `${BASE_URL}/auth/users/send-phone-verification/`,
          { phone_number: phoneNumber },
          { headers }
        )
      )
    );
  }

  syncUser$() {
    return this.readUser$().pipe(
      tap(response => {
        this.profile$.next(response.profile);
        this.setProfileName(response.profile.display_name);
      }),
      concatMap(response => {
        return forkJoin([
          this.setUsername(response.username),
          this.setEmail(response.email),
          this.setPhoneVerfied(response.phone_verified),
          this.setEmailVerfied(response.email_verified),
          this.setPoints(Number(response.user_wallet.points)),
          this.setRerferralCode(response.referral_code),
        ]);
      })
    );
  }

  async hasLoggedIn() {
    await this.migrate();
    const token = await this.preferences.getString(PrefKeys.TOKEN);
    return !!token;
  }

  private async setUsername(value: string) {
    return this.preferences.setString(PrefKeys.USERNAME, value);
  }

  private async setProfileName(value: string) {
    return this.preferences.setString(PrefKeys.PROFILE_NAME, value);
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

  async getAuthHeadersWithApiKey() {
    return {
      authorization: `token ${await this.getToken()}`,
      'x-api-key': TRUSTED_CLIENT_KEY,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private isJWTTokenExpired(token: CachedQueryJWTToken) {
    const secondsSinceCached = secondSince(token.timestamp);
    // In the backend Query JWT Token expires in 5 minutes.
    // We consider not expired if it's 4 minutes old, so we have 1 minute in buffer
    const expiredAfterSeconds = 240; // 4 minutes
    return secondsSinceCached > expiredAfterSeconds;
  }

  private async getCachedQueryJWTToken() {
    const value = await this.preferences.getString(
      PrefKeys.CACHED_QUERY_JWT_TOKEN
    );
    if (value === '') return undefined;
    const token: Partial<CachedQueryJWTToken> = JSON.parse(value);
    if (!token.access || !token.refresh || !token.timestamp) {
      return undefined;
    }
    return token as CachedQueryJWTToken;
  }

  private async setCachedQueryJWTToken(value: CachedQueryJWTToken) {
    return this.preferences.setString(
      PrefKeys.CACHED_QUERY_JWT_TOKEN,
      JSON.stringify(value)
    );
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

  private async setPhoneVerfied(value: boolean) {
    return this.preferences.setBoolean(PrefKeys.PHONE_VERIFIED, value);
  }

  private async setEmailVerfied(value: boolean) {
    return this.preferences.setBoolean(PrefKeys.EMAIL_VERIFIED, value);
  }

  private async setPoints(value: number) {
    return this.preferences.setNumber(PrefKeys.POINTS, value);
  }

  private async setRerferralCode(value: string) {
    return this.preferences.setString(PrefKeys.REFERRAL_CODE, value);
  }

  async getReferralCode() {
    return this.preferences.getString(PrefKeys.REFERRAL_CODE);
  }
}

const enum PrefKeys {
  TOKEN = 'TOKEN',
  USERNAME = 'USERNAME',
  PROFILE_NAME = 'PROFILE_NAME',
  EMAIL = 'EMAIL',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  PHONE_VERIFIED = 'PHONE_VERIFIED',
  POINTS = 'POINTS',
  REFERRAL_CODE = 'REFERRAL_CODE',
  CACHED_QUERY_JWT_TOKEN = 'CACHED_QUERY_JWT_TOKEN',
}

interface LoginResult {
  readonly username: string;
  readonly email: string;
}

export interface LoginResponse {
  readonly auth_token: string;
}

export interface QueryJWTTokenResponse {
  readonly access: string;
  readonly refresh: string;
}

export interface CachedQueryJWTToken extends QueryJWTTokenResponse {
  readonly timestamp: number;
}

export interface ReadUserResponse {
  readonly username: string;
  readonly email: string;
  readonly phone_verified: boolean;
  readonly email_verified: boolean;
  readonly profile: ReadProfileResponse;
  readonly user_wallet: {
    asset_wallet: string;
    asset_wallet_num: string | null;
    integrity_wallet: string;
    integrity_wallet_num: string | null;
    points: string;
    num_wallet_name: string;
    billed_num: string;
  };
  readonly referral_code: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CreateUserResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ResendActivationEmailResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ResetPasswordResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SendPhoneVerificationResponse {}

export interface ReadProfileResponse {
  display_name: string;
  profile_background: string | null;
  profile_background_thumbnail: string | null;
  profile_picture: string | null;
  profile_picture_thumbnail: string | null;
  description: string;
  phone_number: string;
}

type UpdateProfileResponse = ReadProfileResponse;

/**
 * Represents the request body for https://dia-backend-dev.numbersprotocol.io/api/v3/redoc/#operation/auth_users_create
 */
export interface SignUpRequestBody {
  username: string;
  email: string;
  password: string;
  activation_method: 'skip' | 'legacy' | 'code';
  language: 'en-us' | 'zh-tw';
  referral_code: string;
  device?: UserDevice;
}

export interface UserDevice {
  fcm_token: string;
  platform: 'ios' | 'android' | 'web';
  device_identifier: string;
}
