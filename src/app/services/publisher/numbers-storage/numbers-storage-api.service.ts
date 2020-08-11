import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { zip } from 'rxjs';
import { map, switchMap, switchMapTo } from 'rxjs/operators';
import { base64ToBlob$ } from 'src/app/utils/encoding/encoding';
import { PreferenceManager } from 'src/app/utils/preferences/preference-manager';
import { baseUrl } from './secret';

const preference = PreferenceManager.NUMBERS_STORAGE_PUBLISHER_PREF;
const enum PrefKeys {
  Enabled = 'enabled',
  AuthToken = 'authToken'
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
      switchMap(tokenCreate => {
        return preference.setString$(PrefKeys.AuthToken, `token ${tokenCreate.auth_token}`);
      }),
      switchMapTo(preference.setBoolean$(PrefKeys.Enabled, true))
    );
  }

  logout$() {
    return preference.setBoolean$(PrefKeys.Enabled, false).pipe(
      switchMapTo(preference.getString$(PrefKeys.AuthToken)),
      map(authToken => new HttpHeaders({ Authorization: authToken })),
      switchMap(headers => this.httpClient.post(`${baseUrl}/auth/token/logout/`, new FormData(), { headers }))
    );
  }

  createMedia$(
    rawFileBase64: string,
    information: string,
    targetProvider: string,
    caption: string,
    signatures: string,
    tag: string
  ) {
    return preference.getString$(PrefKeys.AuthToken).pipe(
      switchMap(headers => zip(base64ToBlob$(rawFileBase64), headers)),
      switchMap(([rawFile, authToken]) => {
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
