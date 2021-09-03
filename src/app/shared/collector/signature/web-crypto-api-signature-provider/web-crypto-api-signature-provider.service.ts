import { Injectable } from '@angular/core';
import {
  createEthAccount,
  loadEthAccount,
} from '../../../../utils/crypto/crypto';
import { PreferenceManager } from '../../../preference-manager/preference-manager.service';
import { Signature } from '../../../repositories/proof/proof';
import { SignatureProvider } from '../signature-provider';

@Injectable({
  providedIn: 'root',
})
export class WebCryptoApiSignatureProvider implements SignatureProvider {
  readonly id = 'WebCryptoApiSignatureProvider';

  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  readonly publicKey$ = this.preferences.getString$(PrefKeys.PUBLIC_KEY);

  readonly privateKey$ = this.preferences.getString$(PrefKeys.PRIVATE_KEY);

  constructor(private readonly preferenceManager: PreferenceManager) {}

  async initialize() {
    const originalPublicKey = await this.getPublicKey();
    const originalPrivateKey = await this.getPrivateKey();
    if (
      originalPublicKey.length === 0 ||
      originalPrivateKey.length === 0 ||
      !originalPublicKey.startsWith('0x')
    ) {
      const account = createEthAccount();
      await this.preferences.setString(PrefKeys.PUBLIC_KEY, account.address);
      await this.preferences.setString(
        PrefKeys.PRIVATE_KEY,
        account.privateKey
      );
    }
  }

  async provide(serializedSortedSignedTargets: string): Promise<Signature> {
    await this.initialize();
    const account = loadEthAccount(await this.getPrivateKey());
    const sign = account.sign(serializedSortedSignedTargets);
    const publicKey = await this.getPublicKey();
    return { signature: sign.signature, publicKey };
  }

  async getPublicKey() {
    return this.preferences.getString(PrefKeys.PUBLIC_KEY);
  }

  async getPrivateKey() {
    return this.preferences.getString(PrefKeys.PRIVATE_KEY);
  }

  async importKeys(publicKey: string, privateKey: string) {
    await this.preferences.setString(PrefKeys.PUBLIC_KEY, publicKey);
    await this.preferences.setString(PrefKeys.PRIVATE_KEY, privateKey);
  }
}

const enum PrefKeys {
  PUBLIC_KEY = 'PUBLIC_KEY',
  PRIVATE_KEY = 'PRIVATE_KEY',
}
