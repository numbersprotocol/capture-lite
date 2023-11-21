import { TestBed } from '@angular/core/testing';
import { defer } from 'rxjs';
import { concatMapTo } from 'rxjs/operators';
import { sortObjectDeeplyByKey } from '../../../../utils/immutable/immutable';
import {
  ProofMetadata,
  RecorderType,
  isSignature,
} from '../../../repositories/proof/proof';
import { SharedTestingModule } from '../../../shared-testing.module';
import { CaptureAppWebCryptoApiSignatureProvider } from './capture-app-web-crypto-api-signature-provider.service';

describe('CaptureAppWebCryptoApiSignatureProvider', () => {
  let provider: CaptureAppWebCryptoApiSignatureProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    provider = TestBed.inject(CaptureAppWebCryptoApiSignatureProvider);
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
    const ProofMetadata: ProofMetadata = {
      spec_version: '',
      recorder: RecorderType.Capture,
      created_at: 0,
      proof_hash: '',
      asset_mime_type: '',
      caption: '',
      information: {},
    };
    const serializedSortedProofMetadata = JSON.stringify(
      sortObjectDeeplyByKey(ProofMetadata as any).toJSON()
    );
    const signature = await provider.provide(serializedSortedProofMetadata);

    expect(isSignature(signature)).toBeTrue();
  });
});
