import { TestBed } from '@angular/core/testing';
import { SharedTestingModule } from '../../../../shared/shared-testing.module';
import { MimeType } from '../../../../utils/mime-type';
import { ImageStore } from '../../image-store/image-store.service';
import {
  AssetMeta,
  Assets,
  DefaultFactId,
  Proof,
  Signatures,
  Truth,
} from './proof';
import { ProofRepository } from './proof-repository.service';

describe('ProofRepository', () => {
  let repo: ProofRepository;
  let proof1: Proof;
  let proof2: Proof;
  let imageStore: ImageStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SharedTestingModule],
    });
    imageStore = TestBed.inject(ImageStore);
    repo = TestBed.inject(ProofRepository);
    proof1 = await Proof.from(
      imageStore,
      PROOF1_ASSETS,
      PROOF1_TRUTH,
      PROOF1_SIGNATURES_VALID
    );
    proof2 = await Proof.from(
      imageStore,
      PROOF2_ASSETS,
      PROOF2_TRUTH,
      PROOF2_SIGNATURES_INVALID
    );
  });

  it('should be created', () => expect(repo).toBeTruthy());

  it('should get empty array when query on initial status', done => {
    repo.all$.subscribe(proofs => {
      expect(proofs).toEqual([]);
      done();
    });
  });

  it('should emit new query on adding proof', async done => {
    await repo.add(proof1);

    repo.all$.subscribe(proofs => {
      expect(proofs.map(p => p.indexedAssets)).toEqual(
        [proof1].map(p => p.indexedAssets)
      );
      done();
    });
  });

  it('should not emit removed proofs', async done => {
    await repo.add(proof1);
    await repo.add(proof2);
    const sameProof1 = await Proof.from(
      imageStore,
      PROOF1_ASSETS,
      PROOF1_TRUTH,
      PROOF1_SIGNATURES_VALID
    );

    await repo.remove(sameProof1);

    repo.all$.subscribe(proofs => {
      expect(proofs.map(p => p.indexedAssets)).toEqual(
        [proof2].map(p => p.indexedAssets)
      );
      done();
    });
  });

  it('should emit updated proof', async done => {
    const sameTimestampProof = await Proof.from(
      imageStore,
      PROOF2_ASSETS,
      PROOF1_TRUTH,
      PROOF1_SIGNATURES_VALID
    );
    await repo.add(proof1);

    await repo.update(
      [sameTimestampProof],
      (x, y) => x.timestamp === y.timestamp
    );

    repo.all$.subscribe(proofs => {
      expect(proofs.map(p => p.indexedAssets)).toEqual(
        [sameTimestampProof].map(p => p.indexedAssets)
      );
      done();
    });
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
const PROOF1_ASSETS: Assets = { [ASSET1_BASE64]: ASSET1 };
const PROOF2_ASSETS: Assets = { [ASSET2_BASE64]: ASSET2 };
const INFO_SNAPSHOT = 'INFO_SNAPSHOT';
const CAPACITOR = 'CAPACITOR';
const GEOLOCATION_LATITUDE1 = 22.917923;
const GEOLOCATION_LATITUDE2 = 23.000213;
const GEOLOCATION_LONGITUDE1 = 120.859958;
const GEOLOCATION_LONGITUDE2 = 120.868472;
const DEVICE_NAME_VALUE1 = 'Sony Xperia 1';
const DEVICE_NAME_VALUE2 = 'xperia1';
const HUMIDITY = 'HUMIDITY';
const HUMIDITY_VALUE = 0.8;
const TIMESTAMP = 1605013013193;
const PROOF1_TRUTH: Truth = {
  timestamp: TIMESTAMP,
  providers: {
    [INFO_SNAPSHOT]: {
      [DefaultFactId.GEOLOCATION_LATITUDE]: GEOLOCATION_LATITUDE1,
      [DefaultFactId.GEOLOCATION_LONGITUDE]: GEOLOCATION_LONGITUDE1,
      [DefaultFactId.DEVICE_NAME]: DEVICE_NAME_VALUE1,
    },
    [CAPACITOR]: {
      [DefaultFactId.GEOLOCATION_LATITUDE]: GEOLOCATION_LATITUDE2,
      [DefaultFactId.GEOLOCATION_LONGITUDE]: GEOLOCATION_LONGITUDE2,
      [DefaultFactId.DEVICE_NAME]: DEVICE_NAME_VALUE2,
      [HUMIDITY]: HUMIDITY_VALUE,
    },
  },
};
const PROOF2_TRUTH: Truth = {
  timestamp: TIMESTAMP,
  providers: {},
};
const SIGNATURE_PROVIDER_ID = 'CAPTURE';
const VALID_SIGNATURE =
  '7163c668f0a0210b2406045eb42c5e4c9cdc2bb5904dd852813fcb3aebeb6fafa1e3af6213724764b819f0240587f5fccfadc90b537f6c4b4948801c63331c6d';
const PUBLIC_KEY =
  '3059301306072a8648ce3d020106082a8648ce3d0301070342000456103d481de5f8dfc854adfc4b6441d03a83f3689ac9ac85cd570293a69c321a6c11c3481db320a186c546dbc3aae62ee7783a13a7fde3e0d1f55fa0d1d79981';
const PROOF1_SIGNATURES_VALID: Signatures = {
  [SIGNATURE_PROVIDER_ID]: {
    signature: VALID_SIGNATURE,
    publicKey: PUBLIC_KEY,
  },
};
const INVALID_SIGNATURE =
  '5d9192a66e2e2b4d22ce69dae407618eb6e052a86bb236bec11a7c154ffe20c0604e392378288340317d169219dfe063c504ed27ea2f47d9ec3868206b1d7f73';
const PROOF2_SIGNATURES_INVALID: Signatures = {
  [SIGNATURE_PROVIDER_ID]: {
    signature: INVALID_SIGNATURE,
    publicKey: PUBLIC_KEY,
  },
};
