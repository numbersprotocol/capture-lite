import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { DiaBackendAuthService } from '../auth/dia-backend-auth.service';
import { BASE_URL } from '../secret';

@Injectable({
  providedIn: 'root',
})
export class DiaBackendWalletService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly authService: DiaBackendAuthService
  ) {}

  getAssetWallet$() {
    return defer(() => this.authService.getAuthHeaders()).pipe(
      concatMap(headers => {
        return this.httpClient.get<DiaBackendWallet>(
          `${BASE_URL}/api/v2/wallets/asset-wallet/`,
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
          `${BASE_URL}/api/v2/wallets/asset-wallet/`,
          formData,
          { headers }
        );
      })
    );
  }
}

export interface DiaBackendWallet {
  id: string;
  type: string;
  address: string;
  private_key: string;
  created_at: string;
  owner: string;
}
