import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, forkJoin } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
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

  readonly ethNumBalance$ = this.preferences.getNumber$(
    PrefKeys.ETH_NUM_BALANCE
  );
  readonly bscNumBalance$ = this.preferences.getNumber$(
    PrefKeys.BSC_NUM_BALANCE
  );
  readonly numWalletAddr$ = this.preferences.getString$(
    PrefKeys.NUM_WALLET_ADDR
  );

  readonly networkConnected$ = this.networkService.connected$;

  readonly isLoadingBalance$ = new BehaviorSubject<boolean>(false);

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

  getNumWallet$() {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        return this.httpClient.get<DiaBackendWallet>(
          `${BASE_URL}/api/v3/wallets/num-wallet/`,
          { headers }
        );
      })
    );
  }

  syncCaptBalance$() {
    this.isLoadingBalance$.next(true);
    return this.getNumWallet$().pipe(
      concatMap(diaBackendWallet =>
        forkJoin([
          this.preferences.setNumber(
            PrefKeys.ETH_NUM_BALANCE,
            diaBackendWallet.num_balance.eth_num
          ),
          this.preferences.setNumber(
            PrefKeys.BSC_NUM_BALANCE,
            diaBackendWallet.num_balance.bsc_num
          ),
          this.preferences.setString(
            PrefKeys.NUM_WALLET_ADDR,
            diaBackendWallet.address
          ),
        ])
      ),
      tap(() => {
        this.isLoadingBalance$.next(false);
      })
    );
  }
}

export interface DiaBackendWallet {
  id: string;
  type: string;
  capt_balance: number;
  num_balance: {
    bsc_num: number;
    eth_num: number;
  };
  address: string;
  private_key: string;
  created_at: string;
  owner: string;
}

const enum PrefKeys {
  ETH_NUM_BALANCE = 'ETH_NUM_BALANCE',
  BSC_NUM_BALANCE = 'BSC_NUM_BALANCE',
  NUM_WALLET_ADDR = 'NUM_WALLET_ADDR',
}
