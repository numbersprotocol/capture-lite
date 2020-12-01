import { Injectable } from '@angular/core';
import { Signature } from '../../../../services/repositories/proof/proof';
import {
  createEcKeyPair,
  signWithSha256AndEcdsa,
} from '../../../../utils/crypto/crypto';
import { PreferenceManager } from '../../../preference-manager/preference-manager.service';
import { SignatureProvider } from '../signature-provider';

@Injectable({
  providedIn: 'root',
})
export class WebCryptoApiSignatureProvider implements SignatureProvider {
  private readonly preferences = this.preferenceManager.getPreferences(name);
  readonly id = name;

  constructor(private readonly preferenceManager: PreferenceManager) {}

  async provide(serializedSortedSignTargets: string): Promise<Signature> {
    const privateKey = await this.getPrivateKey();
    const signature = await signWithSha256AndEcdsa(
      serializedSortedSignTargets,
      privateKey
    );
    const publicKey = await this.getPublicKey();
    return { signature, publicKey };
  }

  async initialize() {
    const originalPublicKey = await this.getPublicKey();
    const originalPrivateKey = await this.getPrivateKey();
    if (originalPublicKey.length === 0 || originalPrivateKey.length === 0) {
      const { publicKey, privateKey } = await createEcKeyPair();
      await this.preferences.setString(PrefKeys.PUBLIC_KEY, publicKey);
      await this.preferences.setString(PrefKeys.PRIVATE_KEY, privateKey);
    }
  }

  getPublicKey$() {
    return this.preferences.getString$(PrefKeys.PUBLIC_KEY);
  }

  async getPublicKey() {
    return this.preferences.getString(PrefKeys.PUBLIC_KEY);
  }

  getPrivateKey$() {
    return this.preferences.getString$(PrefKeys.PRIVATE_KEY);
  }

  async getPrivateKey() {
    return this.preferences.getString(PrefKeys.PRIVATE_KEY);
  }
}

const enum PrefKeys {
  PUBLIC_KEY = 'PUBLIC_KEY',
  PRIVATE_KEY = 'PRIVATE_KEY',
}
