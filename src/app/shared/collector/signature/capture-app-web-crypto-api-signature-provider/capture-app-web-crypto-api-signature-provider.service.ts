import { Injectable } from '@angular/core';
import { CameraSource } from '@capacitor/camera';
import { createEthAccount } from '../../../../utils/crypto/crypto';
import { signWithIntegritySha } from '../../../../utils/nit/nit';
import { PreferenceManager } from '../../../preference-manager/preference-manager.service';
import { RecorderType, Signature } from '../../../repositories/proof/proof';
import { SignatureProvider } from '../signature-provider';

@Injectable({
  providedIn: 'root',
})
export class CaptureAppWebCryptoApiSignatureProvider
  implements SignatureProvider
{
  readonly deprecatedProviderId = 'WebCryptoApiSignatureProvider';
  readonly id = 'CaptureAppWebCryptoApiSignatureProvider';

  private readonly preferences = this.preferenceManager.getPreferences(this.id);

  readonly publicKey$ = this.preferences.getString$(PrefKeys.PUBLIC_KEY);

  readonly privateKey$ = this.preferences.getString$(PrefKeys.PRIVATE_KEY);

  constructor(private readonly preferenceManager: PreferenceManager) {}

  idFor(source: any): string {
    switch (source) {
      case CameraSource.Photos:
        return 'UploaderWebCryptoApiSignatureProvider';
      case CameraSource.Camera:
        return this.id;
      default:
        return this.id;
    }
  }

  /**
   * Determines the appropriate recorder type based on the camera source.
   *
   * @param cameraSource - The CameraSource used for determining the recorder type
   * @returns The RecorderType associated with the given camera source
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static recorderFor(source: CameraSource): RecorderType {
    switch (source) {
      case CameraSource.Photos:
        return RecorderType.UploaderWebCryptoApiSignatureProvider;
      case CameraSource.Camera:
        return RecorderType.CaptureAppWebCryptoApiSignatureProvider;
      default:
        return RecorderType.Capture;
    }
  }

  async initialize() {
    await this.copyKeysFromWebCryptoApiSignatureProviderIfAny();
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

  async provide(signMessage: string): Promise<Signature> {
    await this.initialize();
    const signature = await signWithIntegritySha(
      signMessage,
      await this.getPrivateKey()
    );
    const publicKey = await this.getPublicKey();
    return { signature, publicKey };
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

  /**
   * Will copy public, private key from WebCryptoApiSignatureProvider preferences
   * to CaptureAppWebCryptoApiSignatureProvider preferences if there are any keys
   */
  private async copyKeysFromWebCryptoApiSignatureProviderIfAny() {
    const publicKey = await this.getWebCryptoApiSignatureProviderPublicKey();
    const privateKey = await this.getWebCryptoApiSignatureProviderPrivateKey();
    if (!!publicKey && !!privateKey) {
      await this.importKeys(publicKey, privateKey);
    }
  }

  private async getWebCryptoApiSignatureProviderPublicKey() {
    return this.preferenceManager
      .getPreferences(this.deprecatedProviderId)
      .getString(PrefKeys.PUBLIC_KEY);
  }

  private async getWebCryptoApiSignatureProviderPrivateKey() {
    return this.preferenceManager
      .getPreferences(this.deprecatedProviderId)
      .getString(PrefKeys.PRIVATE_KEY);
  }
}

const enum PrefKeys {
  PUBLIC_KEY = 'PUBLIC_KEY',
  PRIVATE_KEY = 'PRIVATE_KEY',
}
