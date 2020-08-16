import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, zip } from 'rxjs';
import { concatMap, concatMapTo, first, map, pluck } from 'rxjs/operators';
import { base64ToBlob$ } from 'src/app/utils/encoding/encoding';
import { PreferenceManager } from 'src/app/utils/preferences/preference-manager';
import { baseUrl } from './secret';

export const enum TargetProvider {
  Numbers = 'Numbers'
}

const preference = PreferenceManager.NUMBERS_STORAGE_PUBLISHER_PREF;
const enum PrefKeys {
  Enabled = 'enabled',
  AuthToken = 'authToken',
  UserName = 'userName',
  Email = 'email'
}

@Injectable({
  providedIn: 'root'
})
export class NumbersStorageApi {

  constructor(
    private readonly httpClient: HttpClient
  ) { }

  isEnabled$() {
    return preference.getBoolean$(PrefKeys.Enabled);
  }

  getUserName$() {
    return preference.getString$(PrefKeys.UserName);
  }

  getEmail$() {
    return preference.getString$(PrefKeys.Email);
  }

  createUser$(
    userName: string,
    email: string,
    password: string
  ) {
    const formData = new FormData();
    formData.append('username', userName);
    formData.append('email', email);
    formData.append('password', password);
    return this.httpClient.post<User>(`${baseUrl}/auth/users/`, formData);
  }

  login$(
    email: string,
    password: string
  ) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    return this.httpClient.post<TokenCreate>(`${baseUrl}/auth/token/login/`, formData).pipe(
      pluck('auth_token'),
      concatMap(authToken => preference.setString$(PrefKeys.AuthToken, `token ${authToken}`)),
      concatMapTo(this.getUserInformation$()),
      concatMap(user => zip(
        preference.setString$(PrefKeys.UserName, user.username),
        preference.setString$(PrefKeys.Email, user.email)
      )),
      concatMapTo(preference.setBoolean$(PrefKeys.Enabled, true))
    );
  }

  getUserInformation$() {
    return preference.getString$(PrefKeys.AuthToken).pipe(
      first(),
      map(authToken => new HttpHeaders({ Authorization: authToken })),
      concatMap(headers => this.httpClient.get<User>(`${baseUrl}/auth/users/me/`, { headers }))
    );
  }

  logout$() {
    return preference.setBoolean$(PrefKeys.Enabled, false).pipe(
      concatMapTo(preference.getString$(PrefKeys.AuthToken)),
      first(),
      map(authToken => new HttpHeaders({ Authorization: authToken })),
      concatMap(headers => this.httpClient.post(`${baseUrl}/auth/token/logout/`, new FormData(), { headers }))
    );
  }

  createMedia$(
    rawFileBase64: string,
    information: string,
    targetProvider: TargetProvider,
    caption: string,
    signatures: string,
    tag: string
  ) {
    return preference.getString$(PrefKeys.AuthToken).pipe(
      first(),
      concatMap(authToken => zip(base64ToBlob$(rawFileBase64), of(authToken))),
      concatMap(([rawFile, authToken]) => {
        const headers = new HttpHeaders({ Authorization: authToken });
        const formData = new FormData();
        formData.append('file', rawFile);
        formData.append('meta', information);
        formData.append('target_provider', targetProvider);
        formData.append('caption', caption);
        formData.append('signature', signatures);
        formData.append('tag', tag);
        return this.httpClient.post(`${baseUrl}/api/v1/media/`, formData, { headers });
      })
    );
  }
}

interface User {
  readonly username: string;
  readonly email: string;
  readonly id: number;
}

interface TokenCreate {
  readonly auth_token: string;
}
