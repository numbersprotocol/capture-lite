import { Observable, of, zip } from 'rxjs';
import { filter, first, map, switchMap, switchMapTo } from 'rxjs/operators';
import { ProofOld } from 'src/app/services/repositories/proof/old-proof';
import { OldSignature } from 'src/app/services/repositories/signature/signature';
import { createEcKeyPair$, signWithSha256AndEcdsa$ } from 'src/app/utils/crypto/crypto';
import { PreferenceManager } from 'src/app/utils/preferences/preference-manager';
import { OldSignatureProvider } from '../signature-provider';

const preferences = PreferenceManager.WEB_CRYPTO_API_PROVIDER_PREF;
const enum PrefKeys {
  PublicKey = 'publicKey',
  PrivateKey = 'privateKey'
}

export class WebCryptoApiProvider extends OldSignatureProvider {

  static readonly ID = 'web-crypto-api';
  readonly id = WebCryptoApiProvider.ID;

  static initialize$() {
    return zip(
      this.getPublicKey$(),
      this.getPrivateKey$()
    ).pipe(
      first(),
      filter(([publicKey, privateKey]) => publicKey.length === 0 || privateKey.length === 0),
      switchMapTo(createEcKeyPair$()),
      switchMap(({ publicKey, privateKey }) => zip(
        preferences.setString$(PrefKeys.PublicKey, publicKey),
        preferences.setString$(PrefKeys.PrivateKey, privateKey)
      ))
    );
  }

  static getPublicKey$() {
    return preferences.getString$(PrefKeys.PublicKey);
  }

  static getPrivateKey$() {
    return preferences.getString$(PrefKeys.PrivateKey);
  }

  protected provide$(proof: ProofOld, serialized: string): Observable<OldSignature> {
    return WebCryptoApiProvider.getPrivateKey$().pipe(
      first(),
      switchMap(privateKeyHex => signWithSha256AndEcdsa$(serialized, privateKeyHex)),
      switchMap(signatureHex => zip(of(signatureHex), WebCryptoApiProvider.getPublicKey$())),
      first(),
      map(([signatureHex, publicKeyHex]) => ({
        proofHash: proof.hash,
        provider: this.id,
        signature: signatureHex,
        publicKey: publicKeyHex
      }))
    );
  }
}
