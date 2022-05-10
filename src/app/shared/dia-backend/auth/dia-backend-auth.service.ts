import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { Storage } from '@capacitor/storage';
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
import { isNonNullable } from '../../../utils/rx-operators/rx-operators';
import { LanguageService } from '../../language/service/language.service';
import { PreferenceManager } from '../../preference-manager/preference-manager.service';
import { PushNotificationService } from '../../push-notification/push-notification.service';
import { BASE_URL, TRUSTED_CLIENT_KEY } from '../secret';

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

  readonly phoneVerified$ = this.preferences.getBoolean$(
    PrefKeys.PHONE_VERIFIED
  );

  readonly emailVerified$ = this.preferences.getBoolean$(
    PrefKeys.EMAIL_VERIFIED
  );

  readonly points$ = this.preferences.getNumber$(PrefKeys.POINTS);

  readonly referralCode$ = this.preferences.getString$(PrefKeys.REFERRAL_CODE);

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
        concatMapTo(this.syncProfile$()),
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

  createUser$(
    username: string,
    email: string,
    password: string,
    referralCodeOptional: string
  ) {
    const requestBody: any = {
      username,
      email,
      password,
      referral_code: referralCodeOptional,
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
            device_identifier: deviceId.uuid,
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
          this.setRerferralCode(response.referral_code),
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

  verifyPhoneVerification$(phoneNumber: string, verificationCode: string) {
    return defer(() => this.getAuthHeaders()).pipe(
      concatMap(headers =>
        this.httpClient.post<VerifyPhoneVerificationResponse>(
          `${BASE_URL}/auth/users/verify-phone-verification/`,
          { phone_number: phoneNumber, verification_code: verificationCode },
          { headers }
        )
      ),
      concatMapTo(this.readUser$()),
      concatMap(response => this.setPhoneVerfied(response.phone_verified))
    );
  }

  syncProfile$() {
    return this.readUser$().pipe(
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

  async getAuthHeadersWithApiKey() {
    return {
      authorization: `token ${await this.getToken()}`,
      'x-api-key': TRUSTED_CLIENT_KEY,
    };
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

  async getPhoneVerified() {
    return this.preferences.getBoolean(PrefKeys.PHONE_VERIFIED);
  }

  private async setEmailVerfied(value: boolean) {
    return this.preferences.setBoolean(PrefKeys.EMAIL_VERIFIED, value);
  }

  async getEmailVerified() {
    return this.preferences.getBoolean(PrefKeys.EMAIL_VERIFIED);
  }

  private async setPoints(value: number) {
    return this.preferences.setNumber(PrefKeys.POINTS, value);
  }

  async getPoints() {
    return this.preferences.getNumber(PrefKeys.POINTS);
  }

  private async setRerferralCode(value: string) {
    return this.preferences.setString(PrefKeys.REFERRAL_CODE, value);
  }

  private async getReferralCode() {
    return this.preferences.getString(PrefKeys.REFERRAL_CODE);
  }
}

const enum PrefKeys {
  TOKEN = 'TOKEN',
  USERNAME = 'USERNAME',
  EMAIL = 'EMAIL',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  PHONE_VERIFIED = 'PHONE_VERIFIED',
  POINTS = 'POINTS',
  REFERRAL_CODE = 'REFERRAL_CODE',
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
  readonly phone_verified: boolean;
  readonly email_verified: boolean;
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
interface UpdateUserResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ResendActivationEmailResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ResetPasswordResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SendPhoneVerificationResponse {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface VerifyPhoneVerificationResponse {}

type GetAvatarResponse = UploadAvatarResponse;

interface UploadAvatarResponse {
  readonly profile_picture_thumbnail?: string;
}
