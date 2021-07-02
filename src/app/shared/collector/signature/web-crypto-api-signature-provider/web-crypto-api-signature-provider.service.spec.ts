import { TestBed } from '@angular/core/testing';
import { defer } from 'rxjs';
import { concatMapTo } from 'rxjs/operators';
import { sortObjectDeeplyByKey } from '../../../../utils/immutable/immutable';
import { isSignature, SignedTargets } from '../../../repositories/proof/proof';
import { SharedTestingModule } from '../../../shared-testing.module';
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

  it('should get public key by Observable after initialization', done => {
    defer(() => provider.initialize())
      .pipe(concatMapTo(provider.publicKey$))
      .subscribe(result => {
        expect(result).toBeTruthy();
        done();
      });
  });

  it('should get private key by Observable after initialization', done => {
    defer(() => provider.initialize())
      .pipe(concatMapTo(provider.privateKey$))
      .subscribe(result => {
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
      indexedAssets: {},
      truth: { timestamp: 0, providers: {} },
    };
    const serializedSortedSignedTargets = JSON.stringify(
      sortObjectDeeplyByKey(signedTargets as any).toJSON()
    );
    const signature = await provider.provide(serializedSortedSignedTargets);

    expect(isSignature(signature)).toBeTrue();
  });
});
