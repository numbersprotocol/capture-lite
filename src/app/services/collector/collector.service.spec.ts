import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../shared/shared-testing.module';
import { getTranslocoModule } from '../../transloco/transloco-root.module.spec';
import { MimeType } from '../../utils/mime-type';
import {
  AssetMeta,
  Assets,
  DefaultFactId,
  Facts,
  Signature,
} from '../repositories/proof/proof';
import { ProofRepository } from '../repositories/proof/proof-repository.service';
import { CollectorService } from './collector.service';
import { FactsProvider } from './facts/facts-provider';
import { SignatureProvider } from './signature/signature-provider';

describe('CollectorService', () => {
  let service: CollectorService;
  let proofRepositorySpy: jasmine.SpyObj<ProofRepository>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ProofRepository', ['add']);
    TestBed.configureTestingModule({
      imports: [SharedTestingModule, getTranslocoModule()],
      providers: [{ provide: ProofRepository, useValue: spy }],
    });
    service = TestBed.inject(CollectorService);
    proofRepositorySpy = TestBed.inject(
      ProofRepository
    ) as jasmine.SpyObj<ProofRepository>;
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should get the stored proof after run', async () => {
    const proof = await service.runAndStore(ASSETS);
    expect(proof.assets).toEqual(ASSETS);
  });

  it('should remove added truth providers', async () => {
    service.addFactsProvider(mockFactsProvider);
    service.removeFactsProvider(mockFactsProvider);

    const proof = await service.runAndStore(ASSETS);

    expect(proof.truth.providers).toEqual({});
  });

  it('should remove added signature providers', async () => {
    service.addSignatureProvider(mockSignatureProvider);
    service.removeSignatureProvider(mockSignatureProvider);

    const proof = await service.runAndStore(ASSETS);

    expect(proof.signatures).toEqual({});
  });

  it('should get the stored proof with provided facts', async () => {
    service.addFactsProvider(mockFactsProvider);
    const proof = await service.runAndStore(ASSETS);
    expect(proof.truth.providers).toEqual({ [mockFactsProvider.id]: FACTS });
  });

  it('should get the stored proof with provided signature', async () => {
    service.addSignatureProvider(mockSignatureProvider);
    const proof = await service.runAndStore(ASSETS);
    expect(proof.signatures).toEqual({ [mockSignatureProvider.id]: SIGNATURE });
  });

  it('should store proof with ProofRepository', async () => {
    const proof = await service.runAndStore(ASSETS);

    expect(proofRepositorySpy.add).toHaveBeenCalledWith(proof);
  });
});

const ASSET1_MIMETYPE: MimeType = 'image/png';
const ASSET1_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAABAaVRYdENyZWF0aW9uIFRpbWUAAAAAADIwMjDlubTljYHkuIDmnIgxMOaXpSAo6YCx5LqMKSAyMOaZgjU55YiGMzfnp5JnJvHNAAAAFUlEQVQImWM0MTH5z4AFMGETxCsBAHRhAaHOZzVQAAAAAElFTkSuQmCC';
const ASSET1: AssetMeta = { mimeType: ASSET1_MIMETYPE };
const ASSET2_MIMETYPE: MimeType = 'image/png';
const ASSET2_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAABHNCSVQICAgIfAhkiAAAABZJREFUCJlj/Pnz538GJMDEgAYICwAAAbkD8p660MIAAAAASUVORK5CYII=';
const ASSET2: AssetMeta = { mimeType: ASSET2_MIMETYPE };
const ASSETS: Assets = {
  [ASSET1_BASE64]: ASSET1,
  [ASSET2_BASE64]: ASSET2,
};

const GEOLOCATION_LATITUDE = 22.917923;
const GEOLOCATION_LONGITUDE = 120.859958;
const DEVICE_NAME_VALUE = 'Sony Xperia 1';
const FACTS: Facts = {
  [DefaultFactId.GEOLOCATION_LATITUDE]: GEOLOCATION_LATITUDE,
  [DefaultFactId.GEOLOCATION_LONGITUDE]: GEOLOCATION_LONGITUDE,
  [DefaultFactId.DEVICE_NAME]: DEVICE_NAME_VALUE,
};

class MockFactsProvider implements FactsProvider {
  readonly id = name;
  async provide(_: Assets) {
    return FACTS;
  }
}

const mockFactsProvider = new MockFactsProvider();

const SIGNATURE_VALUE =
  '575cbd72438eec799ffc5d78b45d968b65fd4597744d2127cd21556ceb63dff4a94f409d87de8d1f554025efdf56b8445d8d18e661b79754a25f45d05f4e26ac';
const PUBLIC_KEY =
  '3059301306072a8648ce3d020106082a8648ce3d03010703420004bc23d419027e59bf1eb94c18bfa4ab5fb6ca8ae83c94dbac5bfdfac39ac8ae16484e23b4d522906c4cd8c7cb1a34cd820fb8d065e1b32c8a28320a68fff243f8';
const SIGNATURE: Signature = {
  signature: SIGNATURE_VALUE,
  publicKey: PUBLIC_KEY,
};
class MockSignatureProvider implements SignatureProvider {
  readonly id = name;
  async provide(_: string) {
    return SIGNATURE;
  }
}

const mockSignatureProvider = new MockSignatureProvider();
