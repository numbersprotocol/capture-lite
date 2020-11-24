import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, zip } from 'rxjs';
import { concatMap, concatMapTo, first, map, pluck } from 'rxjs/operators';
import { dataUrlWithBase64ToBlob$ } from 'src/app/utils/encoding/encoding';
import { PreferenceManager } from 'src/app/utils/preferences/preference-manager';
import { secret } from '../../../../environments/secret';
import { getSortedProofInformation, OldSignature } from '../../repositories/proof/old-proof-adapter';
import { Proof } from '../../repositories/proof/proof';
import { Asset } from './repositories/asset/asset';

export const enum TargetProvider {
  Numbers = 'Numbers'
}

const baseUrl = secret.numbersStorageBaseUrl;
const preference = PreferenceManager.NUMBERS_STORAGE_PUBLISHER_PREF;
const enum PrefKeys {
  Enabled = 'enabled',
  AuthToken = 'authToken',
  Username = 'username',
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

  getUsername$() {
    return preference.getString$(PrefKeys.Username);
  }

  getEmail$() {
    return preference.getString$(PrefKeys.Email);
  }

  createUser$(
    username: string,
    email: string,
    password: string
  ) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    return this.httpClient.post<UserResponse>(`${baseUrl}/auth/users/`, formData);
  }

  login$(
    email: string,
    password: string
  ) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    return this.httpClient.post<TokenCreateResponse>(`${baseUrl}/auth/token/login/`, formData).pipe(
      pluck('auth_token'),
      concatMap(authToken => preference.setString$(PrefKeys.AuthToken, `token ${authToken}`)),
      concatMapTo(this.getUserInformation$()),
      concatMap(user => zip(
        preference.setString$(PrefKeys.Username, user.username),
        preference.setString$(PrefKeys.Email, user.email)
      )),
      concatMapTo(preference.setBoolean$(PrefKeys.Enabled, true))
    );
  }

  getUserInformation$() {
    return this.getHttpHeadersWithAuthToken$().pipe(
      concatMap(headers => this.httpClient.get<UserResponse>(`${baseUrl}/auth/users/me/`, { headers }))
    );
  }

  logout$() {
    return preference.setBoolean$(PrefKeys.Enabled, false).pipe(
      concatMapTo(this.getHttpHeadersWithAuthToken$()),
      concatMap(headers => this.httpClient.post(`${baseUrl}/auth/token/logout/`, {}, { headers })),
      concatMapTo(zip(
        preference.setString$(PrefKeys.Username, 'has-logged-out'),
        preference.setString$(PrefKeys.Email, 'has-logged-out'),
        preference.setString$(PrefKeys.AuthToken, '')
      ))
    );
  }

  readAsset$(id: string) {
    return this.getHttpHeadersWithAuthToken$().pipe(
      concatMap(headers => this.httpClient.get<Asset>(`${baseUrl}/api/v2/assets/${id}/`, { headers }))
    );
  }

  createAsset$(
    rawFileBase64: string,
    proof: Proof,
    targetProvider: TargetProvider,
    caption: string,
    signatures: OldSignature[],
    tag: string
  ) {
    return this.getHttpHeadersWithAuthToken$().pipe(
      concatMap(headers => zip(
        dataUrlWithBase64ToBlob$(rawFileBase64),
        getSortedProofInformation(proof),
        of(headers)
      )),
      concatMap(([rawFile, sortedProofInformation, headers]) => {
        const formData = new FormData();
        formData.append('asset_file', rawFile);
        formData.append('asset_file_mime_type', Object.values(proof.assets)[0].mimeType);
        formData.append('meta', JSON.stringify(sortedProofInformation));
        formData.append('target_provider', targetProvider);
        formData.append('caption', caption);
        formData.append('signature', JSON.stringify(signatures));
        formData.append('tag', tag);
        return this.httpClient.post<Asset>(`${baseUrl}/api/v2/assets/`, formData, { headers });
      })
    );
  }

  listTransactions$() {
    return this.getHttpHeadersWithAuthToken$().pipe(
      concatMap(headers => this.httpClient.get<TransactionListResponse>(`${baseUrl}/api/v2/transactions/`, { headers }))
    );
  }

  createTransaction$(assetId: string, email: string, caption: string) {
    return this.getHttpHeadersWithAuthToken$().pipe(
      concatMap(headers => this.httpClient.post<TransactionCreateResponse>(
        `${baseUrl}/api/v2/transactions/`,
        { asset_id: assetId, email, caption },
        { headers }
      ))
    );
  }

  listInbox$() {
    return this.getHttpHeadersWithAuthToken$().pipe(
      concatMap(headers => this.httpClient.get<InboxReponse>(`${baseUrl}/api/v2/transactions/inbox/`, { headers }))
    );
  }

  acceptTransaction$(id: string) {
    return this.getHttpHeadersWithAuthToken$().pipe(
      concatMap(headers => this.httpClient.post<Transaction>(`${baseUrl}/api/v2/transactions/${id}/accept/`, {}, { headers })),
      concatMap(transaction => this.readAsset$(transaction.asset.id))
    );
  }

  getImage$(url: string) {
    return this.httpClient.get(url, { responseType: 'blob' });
  }

  private getHttpHeadersWithAuthToken$() {
    return preference.getString$(PrefKeys.AuthToken).pipe(
      first(),
      map(authToken => new HttpHeaders({ Authorization: authToken }))
    );
  }
}

interface UserResponse {
  readonly username: string;
  readonly email: string;
  readonly id: number;
}

interface TokenCreateResponse {
  readonly auth_token: string;
}

interface TransactionListResponse {
  readonly results: Transaction[];
}

interface InboxReponse {
  readonly results: Transaction[];
}

export interface Transaction {
  id: string;
  asset: {
    asset_file_thumbnail: string;
    caption: string;
    id: string;
  };
  sender: string;
  created_at: string;
  expired: boolean;
  fulfilled_at?: null | string;
}

interface TransactionCreateResponse {
  readonly id: string;
  readonly asset_id: string;
  readonly email: string;
  readonly caption: string;
}
