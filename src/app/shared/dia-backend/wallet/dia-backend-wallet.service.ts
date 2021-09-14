import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { NetworkService } from '../../network/network.service';
import { PreferenceManager } from '../../preference-manager/preference-manager.service';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendWalletService {
  readonly id = 'DiaBackendWalletService';

  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  readonly captBalance$ = this.preferences.getNumber$(PrefKeys.CAPT_BALANCE);

  readonly networkConnected$ = this.networkService.connected$;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly networkService: NetworkService,
    private readonly preferenceManager: PreferenceManager
  ) {}

  getAssetWallet$() {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        return this.httpClient.get<DiaBackendWallet>(
          `${BASE_URL}/api/v3/wallets/asset-wallet/`,
          { headers }
        );
      })
    );
  }

  setAssetWallet$(privateKey: string) {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        const formData = new FormData();
        formData.set('private_key', privateKey);
        return this.httpClient.post<DiaBackendWallet>(
          `${BASE_URL}/api/v3/wallets/asset-wallet/`,
          formData,
          { headers }
        );
      })
    );
  }

  getManagedWallet$() {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        return this.httpClient.get<DiaBackendWallet>(
          `${BASE_URL}/api/v3/wallets/managed-wallet/`,
          { headers }
        );
      })
    );
  }

  syncCaptBalance$() {
    return this.getManagedWallet$().pipe(
      concatMap(diaBackendWallet =>
        this.preferences.setNumber(
          PrefKeys.CAPT_BALANCE,
          diaBackendWallet.capt_balance
        )
      )
    );
  }
}

export interface DiaBackendWallet {
  id: string;
  type: string;
  capt_balance: number;
  address: string;
  private_key: string;
  created_at: string;
  owner: string;
}

const enum PrefKeys {
  CAPT_BALANCE = 'CAPT_BALANCE',
}
