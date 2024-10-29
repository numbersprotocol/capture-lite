import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, defer, forkJoin } from 'rxjs';
import { catchError, concatMap, first } from 'rxjs/operators';
import { ErrorService } from '../../error/error.service';
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

  readonly assetWalletEthNumBalance$ = this.preferences.getNumber$(
    PrefKeys.ASSET_WALLET_ETH_NUM_BALANCE
  );
  readonly assetWalletMainnetNumBalance$ = this.preferences.getNumber$(
    PrefKeys.ASSET_WALLET_MAINNET_NUM_BALANCE
  );
  readonly assetWalletAddr$ = this.preferences.getString$(
    PrefKeys.ASSET_WALLET_ADDR
  );

  readonly integrityWalletEthNumBalance$ = this.preferences.getNumber$(
    PrefKeys.INTEGRITY_WALLET_ETH_NUM_BALANCE
  );

  readonly integrityWalletMainnetNumBalance$ = this.preferences.getNumber$(
    PrefKeys.INTEGRITY_WALLET_MAINNET_NUM_BALANCE
  );

  // For integrity wallet addr, use WebCryptoApiSignatureProvider.publicKey$

  readonly reloadWallet$ = new BehaviorSubject(false);

  readonly networkConnected$ = this.networkService.connected$;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService,
    private readonly networkService: NetworkService,
    private readonly preferenceManager: PreferenceManager,
    private readonly errorService: ErrorService
  ) {}

  getIntegrityWallet$() {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        return this.httpClient.get<DiaBackendWallet>(
          `${BASE_URL}/api/v3/wallets/asset-wallet/`,
          { headers }
        );
      })
    );
  }

  setIntegrityWallet$(privateKey: string) {
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

  getAssetWallet$() {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        return this.httpClient.get<DiaBackendWallet>(
          `${BASE_URL}/api/v3/wallets/num-wallet/`,
          { headers }
        );
      })
    );
  }

  syncAssetWalletBalance$() {
    return this.getAssetWallet$().pipe(
      concatMap(diaBackendWallet =>
        forkJoin([
          this.preferences.setNumber(
            PrefKeys.ASSET_WALLET_ETH_NUM_BALANCE,
            diaBackendWallet.num_balance.eth_num
          ),
          this.preferences.setNumber(
            PrefKeys.ASSET_WALLET_MAINNET_NUM_BALANCE,
            diaBackendWallet.num_balance.num
          ),
          this.preferences.setString(
            PrefKeys.ASSET_WALLET_ADDR,
            diaBackendWallet.address
          ),
        ])
      ),
      catchError((err: unknown) => this.errorService.toastDiaBackendError$(err))
    );
  }

  syncIntegrityAndAssetWalletBalance$() {
    return combineLatest([
      this.getIntegrityWallet$(),
      this.getAssetWallet$(),
    ]).pipe(
      first(),
      concatMap(([integrityWallet, assetWallet]) =>
        forkJoin([
          this.preferences.setNumber(
            PrefKeys.INTEGRITY_WALLET_ETH_NUM_BALANCE,
            integrityWallet.num_balance.eth_num
          ),
          this.preferences.setNumber(
            PrefKeys.INTEGRITY_WALLET_MAINNET_NUM_BALANCE,
            integrityWallet.num_balance.num
          ),
          this.preferences.setNumber(
            PrefKeys.ASSET_WALLET_ETH_NUM_BALANCE,
            assetWallet.num_balance.eth_num
          ),
          this.preferences.setNumber(
            PrefKeys.ASSET_WALLET_MAINNET_NUM_BALANCE,
            assetWallet.num_balance.num
          ),
        ])
      )
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
    num: number;
  };
  address: string;
  private_key: string;
  created_at: string;
  owner: string;
}

const enum PrefKeys {
  ASSET_WALLET_ETH_NUM_BALANCE = 'ASSET_WALLET_ETH_NUM_BALANCE',
  ASSET_WALLET_MAINNET_NUM_BALANCE = 'ASSET_WALLET_MAINNET_NUM_BALANCE',
  ASSET_WALLET_ADDR = 'ASSET_WALLET_ADDR',
  INTEGRITY_WALLET_ETH_NUM_BALANCE = 'INTEGRITY_WALLET_ETH_NUM_BALANCE',
  INTEGRITY_WALLET_MAINNET_NUM_BALANCE = 'INTEGRITY_WALLET_MAINNET_NUM_BALANCE',
}
