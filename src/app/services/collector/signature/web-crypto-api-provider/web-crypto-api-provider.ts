import { of, zip } from 'rxjs';
import { filter, first, map, switchMap, switchMapTo } from 'rxjs/operators';
import { Signature } from '../../../../services/repositories/proof/proof';
import {
  createEcKeyPair$,
  signWithSha256AndEcdsa$,
} from '../../../../utils/crypto/crypto';
import { PreferenceManager } from '../../../../utils/preferences/preference-manager';
import { SignatureProvider } from '../signature-provider';

const preferences = PreferenceManager.WEB_CRYPTO_API_PROVIDER_PREF;
const enum PrefKeys {
  PublicKey = 'publicKey',
  PrivateKey = 'privateKey',
}

export class WebCryptoApiProvider implements SignatureProvider {
  readonly id = name;

  // TODO: Avoid using static methods `getPrivateKey$` and `getPublicKey$` after
  //       refactor preference utils.
  // tslint:disable-next-line: prefer-function-over-method
  async provide(serializedSortedSignTargets: string): Promise<Signature> {
    return WebCryptoApiProvider.getPrivateKey$()
      .pipe(
        first(),
        switchMap(privateKeyHex =>
          signWithSha256AndEcdsa$(serializedSortedSignTargets, privateKeyHex)
        ),
        switchMap(signatureHex =>
          zip(of(signatureHex), WebCryptoApiProvider.getPublicKey$())
        ),
        first(),
        map(([signatureHex, publicKeyHex]) => ({
          signature: signatureHex,
          publicKey: publicKeyHex,
        }))
      )
      .toPromise();
  }

  static initialize$() {
    return zip(
      WebCryptoApiProvider.getPublicKey$(),
      WebCryptoApiProvider.getPrivateKey$()
    ).pipe(
      first(),
      filter(
        ([publicKey, privateKey]) =>
          publicKey.length === 0 || privateKey.length === 0
      ),
      switchMapTo(createEcKeyPair$()),
      switchMap(({ publicKey, privateKey }) =>
        zip(
          preferences.setString$(PrefKeys.PublicKey, publicKey),
          preferences.setString$(PrefKeys.PrivateKey, privateKey)
        )
      )
    );
  }

  static getPublicKey$() {
    return preferences.getString$(PrefKeys.PublicKey);
  }

  static getPrivateKey$() {
    return preferences.getString$(PrefKeys.PrivateKey);
  }
}
