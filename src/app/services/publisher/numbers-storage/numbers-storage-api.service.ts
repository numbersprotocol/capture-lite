import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer, of, zip } from 'rxjs';
import { concatMap, concatMapTo, pluck } from 'rxjs/operators';
import { secret } from '../../../../environments/secret';
import { base64ToBlob } from '../../../utils/encoding/encoding';
import { PreferenceManager } from '../../preference-manager/preference-manager.service';
import {
  getSortedProofInformation,
  OldDefaultInformationName,
  OldSignature,
  SortedProofInformation,
} from '../../repositories/proof/old-proof-adapter';
import { DefaultFactId, Proof } from '../../repositories/proof/proof';
import { Asset } from './repositories/asset/asset';

@Injectable({
  providedIn: 'root',
})
export class NumbersStorageApi {
  private readonly preferences = this.preferenceManager.getPreferences(
    NumbersStorageApi.name
  );

  constructor(
    private readonly httpClient: HttpClient,
    private readonly preferenceManager: PreferenceManager
  ) {}

  createUser$(username: string, email: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    return this.httpClient.post<UserResponse>(
      `${baseUrl}/auth/users/`,
      formData
    );
  }

  login$(email: string, password: string) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    return this.httpClient
      .post<TokenCreateResponse>(`${baseUrl}/auth/token/login/`, formData)
      .pipe(
        pluck('auth_token'),
        concatMap(authToken => this.storeAuthToken(`token ${authToken}`)),
        concatMapTo(this.getUserInformation$()),
        concatMap(user =>
          zip(this.setUsername(user.username), this.setEmail(user.email))
        ),
        concatMapTo(defer(() => this.setEnabled(true)))
      );
  }

  getUserInformation$() {
    return defer(() => this.getHttpHeadersWithAuthToken()).pipe(
      concatMap(headers =>
        this.httpClient.get<UserResponse>(`${baseUrl}/auth/users/me/`, {
          headers,
        })
      )
    );
  }

  logout$() {
    return defer(() => this.setEnabled(false)).pipe(
      concatMapTo(defer(() => this.getHttpHeadersWithAuthToken())),
      concatMap(headers =>
        this.httpClient.post(`${baseUrl}/auth/token/logout/`, {}, { headers })
      ),
      concatMapTo(
        defer(() =>
          Promise.all([
            this.setUsername('has-logged-out'),
            this.setEmail('has-logged-out'),
            this.storeAuthToken(''),
          ])
        )
      )
    );
  }

  createOrUpdateDevice$(
    platform: string,
    deviceIdentifier: string,
    fcmToken: string
  ) {
    const formData = new FormData();
    formData.append('platform', platform);
    formData.append('device_identifier', deviceIdentifier);
    formData.append('fcm_token', fcmToken);
    return defer(() => this.getHttpHeadersWithAuthToken()).pipe(
      concatMap(headers =>
        this.httpClient.post<DeviceResponse>(
          `${baseUrl}/auth/devices/`,
          formData,
          { headers }
        )
      )
    );
  }

  readAsset$(id: string) {
    return defer(() => this.getHttpHeadersWithAuthToken()).pipe(
      concatMap(headers =>
        this.httpClient.get<Asset>(`${baseUrl}/api/v2/assets/${id}/`, {
          headers,
        })
      )
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
    const proofMimeType = Object.values(proof.indexedAssets)[0].mimeType;
    return defer(() => this.getHttpHeadersWithAuthToken()).pipe(
      concatMap(headers =>
        zip(
          defer(() => base64ToBlob(rawFileBase64, proofMimeType)),
          getSortedProofInformation(proof),
          of(headers)
        )
      ),
      concatMap(([rawFile, sortedProofInformation, headers]) => {
        const oldSortedProofInformation = replaceDefaultFactIdWithOldDefaultInformationName(
          sortedProofInformation
        );
        const formData = new FormData();
        formData.append('asset_file', rawFile);
        formData.append('asset_file_mime_type', proofMimeType);
        formData.append('meta', JSON.stringify(oldSortedProofInformation));
        formData.append('target_provider', targetProvider);
        formData.append('caption', caption);
        formData.append('signature', JSON.stringify(signatures));
        formData.append('tag', tag);
        return this.httpClient.post<Asset>(
          `${baseUrl}/api/v2/assets/`,
          formData,
          { headers }
        );
      })
    );
  }

  listTransactions$() {
    return defer(() => this.getHttpHeadersWithAuthToken()).pipe(
      concatMap(headers =>
        this.httpClient.get<TransactionListResponse>(
          `${baseUrl}/api/v2/transactions/`,
          { headers }
        )
      )
    );
  }

  createTransaction$(assetId: string, email: string, caption: string) {
    return defer(() => this.getHttpHeadersWithAuthToken()).pipe(
      concatMap(headers =>
        this.httpClient.post<TransactionCreateResponse>(
          `${baseUrl}/api/v2/transactions/`,
          { asset_id: assetId, email, caption },
          { headers }
        )
      )
    );
  }

  listInbox$() {
    return defer(() => this.getHttpHeadersWithAuthToken()).pipe(
      concatMap(headers =>
        this.httpClient.get<InboxReponse>(
          `${baseUrl}/api/v2/transactions/inbox/`,
          { headers }
        )
      )
    );
  }

  acceptTransaction$(id: string) {
    return defer(() => this.getHttpHeadersWithAuthToken()).pipe(
      concatMap(headers =>
        this.httpClient.post<Transaction>(
          `${baseUrl}/api/v2/transactions/${id}/accept/`,
          {},
          { headers }
        )
      )
    );
  }

  getImage$(url: string) {
    return this.httpClient.get(url, { responseType: 'blob' });
  }

  private async getHttpHeadersWithAuthToken() {
    const authToken = await this.preferences.getString(PrefKeys.AUTH_TOKEN);
    return new HttpHeaders({ Authorization: authToken });
  }

  private async storeAuthToken(value: string) {
    return this.preferences.setString(PrefKeys.AUTH_TOKEN, value);
  }

  isEnabled$() {
    return this.preferences.getBoolean$(PrefKeys.ENABLED);
  }

  async setEnabled(value: boolean) {
    return this.preferences.setBoolean(PrefKeys.ENABLED, value);
  }

  getUsername$() {
    return this.preferences.getString$(PrefKeys.USERNAME);
  }

  async setUsername(value: string) {
    return this.preferences.setString(PrefKeys.USERNAME, value);
  }

  getEmail$() {
    return this.preferences.getString$(PrefKeys.EMAIL);
  }

  async setEmail(value: string) {
    return this.preferences.setString(PrefKeys.EMAIL, value);
  }
}

function replaceDefaultFactIdWithOldDefaultInformationName(
  sortedProofInformation: SortedProofInformation
): SortedProofInformation {
  return {
    proof: sortedProofInformation.proof,
    information: sortedProofInformation.information.map(info => {
      if (info.name === DefaultFactId.DEVICE_NAME) {
        return {
          provider: info.provider,
          value: info.value,
          name: OldDefaultInformationName.DEVICE_NAME,
        };
      }
      if (info.name === DefaultFactId.GEOLOCATION_LATITUDE) {
        return {
          provider: info.provider,
          value: info.value,
          name: OldDefaultInformationName.GEOLOCATION_LATITUDE,
        };
      }
      if (info.name === DefaultFactId.GEOLOCATION_LONGITUDE) {
        return {
          provider: info.provider,
          value: info.value,
          name: OldDefaultInformationName.GEOLOCATION_LONGITUDE,
        };
      }
      return info;
    }),
  };
}

const baseUrl = secret.numbersStorageBaseUrl;

export const enum TargetProvider {
  Numbers = 'Numbers',
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
  receiver_email: string;
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

interface DeviceResponse {
  readonly id: string;
  readonly owner: string;
  readonly platform: string;
  readonly device_identifier: string;
  readonly registered_at: string;
  readonly last_updated_at: string;
}

const enum PrefKeys {
  ENABLED = 'ENABLED',
  AUTH_TOKEN = 'AUTH_TOKEN',
  USERNAME = 'USERNAME',
  EMAIL = 'EMAIL',
}
