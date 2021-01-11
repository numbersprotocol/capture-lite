import { Injectable } from '@angular/core';
import {
  createEcKeyPair,
  signWithSha256AndEcdsa,
} from '../../../../../utils/crypto/crypto';
import { Signature } from '../../../../services/repositories/proof/proof';
import { PreferenceManager } from '../../../preference-manager/preference-manager.service';
import { SignatureProvider } from '../signature-provider';

@Injectable({
  providedIn: 'root',
})
export class WebCryptoApiSignatureProvider implements SignatureProvider {
  readonly id = WebCryptoApiSignatureProvider.name;
  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  constructor(private readonly preferenceManager: PreferenceManager) {}

  async initialize() {
    const originalPublicKey = await this.getPublicKey();
    const originalPrivateKey = await this.getPrivateKey();
    if (originalPublicKey.length === 0 || originalPrivateKey.length === 0) {
      const { publicKey, privateKey } = await createEcKeyPair();
      await this.preferences.setString(PrefKeys.PUBLIC_KEY, publicKey);
      await this.preferences.setString(PrefKeys.PRIVATE_KEY, privateKey);
    }
  }

  async provide(serializedSortedSignedTargets: string): Promise<Signature> {
    await this.initialize();
    const privateKey = await this.getPrivateKey();
    const signature = await signWithSha256AndEcdsa(
      serializedSortedSignedTargets,
      privateKey
    );
    const publicKey = await this.getPublicKey();
    return { signature, publicKey };
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
