import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../../shared/shared-testing.module';
import { sortObjectDeeplyByKey } from '../../../../../utils/immutable/immutable';
import { isSignature, SignedTargets } from '../../../repositories/proof/proof';
import { WebCryptoApiSignatureProvider } from './web-crypto-api-signature-provider.service';

describe('WebCryptoApiSignatureProvider', () => {
  let provider: WebCryptoApiSignatureProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    provider = TestBed.inject(WebCryptoApiSignatureProvider);
  });

  it('should be created', () => expect(provider).toBeTruthy());

  it('should have ID', () => expect(provider.id).toBeTruthy());

  it('should get key pair by value after initialization', async () => {
    await provider.initialize();

    expect(await provider.getPublicKey()).toBeTruthy();
    expect(await provider.getPrivateKey()).toBeTruthy();
  });

  it('should get public key by Observable after initialization', async done => {
    await provider.initialize();

    provider.getPublicKey$().subscribe(result => {
      expect(result).toBeTruthy();
      done();
    });
  });

  it('should get private key by Observable after initialization', async done => {
    await provider.initialize();

    provider.getPrivateKey$().subscribe(result => {
      expect(result).toBeTruthy();
      done();
    });
  });

  it('should initialize idempotently', async () => {
    await provider.initialize();
    const publicKey = await provider.getPublicKey();
    const privateKey = await provider.getPrivateKey();
    await provider.initialize();

    expect(await provider.getPublicKey()).toEqual(publicKey);
    expect(await provider.getPrivateKey()).toEqual(privateKey);
  });

  it('should provide signature', async () => {
    const signedTargets: SignedTargets = {
      assets: {},
      truth: { timestamp: 0, providers: {} },
    };
    const serializedSortedSignedTargets = JSON.stringify(
      sortObjectDeeplyByKey(signedTargets as any).toJSON()
    );
    const signature = await provider.provide(serializedSortedSignedTargets);

    expect(isSignature(signature)).toBeTrue();
  });
});
