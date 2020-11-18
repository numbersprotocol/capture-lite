import { verifyWithSha256AndEcdsa$ } from 'src/app/utils/crypto/crypto';
import { MimeType } from 'src/app/utils/mime-type';
import { Asset, Assets, DefaultFactId, Proof, Signatures, Truth } from './proof';

describe('Proof', () => {
  let proof: Proof;

  beforeAll(() => Proof.registerSignatureProvider(
    SIGNATURE_PROVIDER_ID,
    { verify: (message, signature, publicKey) => verifyWithSha256AndEcdsa$(message, signature, publicKey).toPromise() }
  ));

  afterAll(() => Proof.unregisterSignatureProvider(SIGNATURE_PROVIDER_ID));

  it('should get the same assets with the parameter of factory method', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.assets).toEqual(ASSETS);
  });

  it('should get the same truth with the parameter of factory method', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.truth).toEqual(TRUTH);
  });

  it('should get the same signatures with the parameter of factory method', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.signatures).toEqual(SIGNATURES_VALID);
  });

  it('should get the same timestamp with the truth in the parameter of factory method', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.timestamp).toEqual(TRUTH.timestamp);
  });

  it('should get same ID with same properties', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    const another = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(await proof.getId()).toEqual(await another.getId());
  });

  it('should have thumbnail when its assets have binary images', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(await proof.getThumbnailDataUrl()).toBeTruthy();
  });

  it('should not have thumbnail when its assets do not have image', async () => {
    proof = await Proof.from(
      { [ASSET1_HASH]: { base64: 'aGVsbG8K', mimeType: 'application/octet-stream' } },
      TRUTH,
      SIGNATURES_VALID
    );
    expect(await proof.getThumbnailDataUrl()).toBeUndefined();
  });

  it('should get any device name when exists', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(
      proof.deviceName === DEVICE_NAME_VALUE1
      || proof.deviceName === DEVICE_NAME_VALUE2
    ).toBeTrue();
  });

  it('should get undefined when device name not exists', async () => {
    proof = await Proof.from(ASSETS, TRUTH_EMPTY, SIGNATURES_VALID);
    expect(proof.deviceName).toBeUndefined();
  });

  it('should get any geolocation latitude when exists', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(
      proof.geolocationLatitude === GEOLOCATION_LATITUDE1
      || proof.geolocationLatitude === GEOLOCATION_LATITUDE2
    ).toBeTrue();
  });

  it('should get undefined when geolocation latitude not exists', async () => {
    proof = await Proof.from(ASSETS, TRUTH_EMPTY, SIGNATURES_VALID);
    expect(proof.geolocationLatitude).toBeUndefined();
  });

  it('should get any geolocation longitude name when exists', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(
      proof.geolocationLongitude === GEOLOCATION_LONGITUDE1
      || proof.geolocationLongitude === GEOLOCATION_LONGITUDE2
    ).toBeTrue();
  });

  it('should get undefined when geolocation longitude not exists', async () => {
    proof = await Proof.from(ASSETS, TRUTH_EMPTY, SIGNATURES_VALID);
    expect(proof.geolocationLongitude).toBeUndefined();
  });

  it('should get existed fact with ID', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.getFactValue(HUMIDITY)).toEqual(HUMIDITY_VALUE);
  });

  it('should get undefined with nonexistent fact ID', async () => {
    const NONEXISTENT = 'NONEXISTENT';
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.getFactValue(NONEXISTENT)).toBeUndefined();
  });

  it('should stringify to ordered JSON string', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    const ASSETS_DIFFERENT_ORDER: Assets = {
      [ASSET2_HASH]: ASSET2,
      [ASSET1_HASH]: {
        mimeType: ASSET1_MIMETYPE,
        base64: ASSET1_BINARY
      }
    };
    const TRUTH_DIFFERENT_ORDER: Truth = {
      providers: {
        [CAPACITOR]: {
          [HUMIDITY]: HUMIDITY_VALUE,
          [DefaultFactId.GEOLOCATION_LONGITUDE]: GEOLOCATION_LONGITUDE2,
          [DefaultFactId.GEOLOCATION_LATITUDE]: GEOLOCATION_LATITUDE2,
          [DefaultFactId.DEVICE_NAME]: DEVICE_NAME_VALUE2
        },
        [INFO_SNAPSHOT]: {
          [DefaultFactId.GEOLOCATION_LONGITUDE]: GEOLOCATION_LONGITUDE1,
          [DefaultFactId.DEVICE_NAME]: DEVICE_NAME_VALUE1,
          [DefaultFactId.GEOLOCATION_LATITUDE]: GEOLOCATION_LATITUDE1
        }
      },
      timestamp: TIMESTAMP
    };
    const proofWithDifferentContentsOrder = await Proof.from(
      ASSETS_DIFFERENT_ORDER,
      TRUTH_DIFFERENT_ORDER,
      SIGNATURES_VALID
    );
    expect(proof.stringify()).toEqual(proofWithDifferentContentsOrder.stringify());
  });

  it('should parse from stringified JSON string', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);

    const parsed = Proof.parse(proof.stringify());

    expect(parsed.assets).toEqual(ASSETS);
    expect(parsed.truth).toEqual(TRUTH);
    expect(parsed.signatures).toEqual(SIGNATURES_VALID);
  });

  it('should be verified with valid signatures', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(await proof.isVerified()).toBeTrue();
  });

  it('should not be verified with invalid signatures', async () => {
    proof = await Proof.from(ASSETS, TRUTH, SIGNATURES_INVALID);
    expect(await proof.isVerified()).toBeFalse();
  });
});

const ASSET1_HASH = '0e87c3cdb045ae9c4a10f63cc615ee4bbf0f2ff9dca6201f045a4cb276cf3122';
const ASSET1_MIMETYPE: MimeType = 'image/png';
const ASSET1_BINARY = 'iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAABAaVRYdENyZWF0aW9uIFRpbWUAAAAAADIwMjDlubTljYHkuIDmnIgxMOaXpSAo6YCx5LqMKSAyMOaZgjU55YiGMzfnp5JnJvHNAAAAFUlEQVQImWM0MTH5z4AFMGETxCsBAHRhAaHOZzVQAAAAAElFTkSuQmCC';
const ASSET1: Asset = {
  base64: ASSET1_BINARY,
  mimeType: ASSET1_MIMETYPE
};
const ASSET2_HASH = '6cb481cace19b70b1a2b927c4d3c504de810cba6f82c5372e58aee9259ba68d3';
const ASSET2_MIMETYPE: MimeType = 'image/png';
const ASSET2_BINARY = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAABHNCSVQICAgIfAhkiAAAABZJREFUCJlj/Pnz538GJMDEgAYICwAAAbkD8p660MIAAAAASUVORK5CYII=';
const ASSET2: Asset = {
  base64: ASSET2_BINARY,
  mimeType: ASSET2_MIMETYPE
};
const ASSETS: Assets = {
  [ASSET1_HASH]: ASSET1,
  [ASSET2_HASH]: ASSET2
};
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
const TRUTH: Truth = {
  timestamp: TIMESTAMP,
  providers: {
    [INFO_SNAPSHOT]: {
      [DefaultFactId.GEOLOCATION_LATITUDE]: GEOLOCATION_LATITUDE1,
      [DefaultFactId.GEOLOCATION_LONGITUDE]: GEOLOCATION_LONGITUDE1,
      [DefaultFactId.DEVICE_NAME]: DEVICE_NAME_VALUE1
    },
    [CAPACITOR]: {
      [DefaultFactId.GEOLOCATION_LATITUDE]: GEOLOCATION_LATITUDE2,
      [DefaultFactId.GEOLOCATION_LONGITUDE]: GEOLOCATION_LONGITUDE2,
      [DefaultFactId.DEVICE_NAME]: DEVICE_NAME_VALUE2,
      [HUMIDITY]: HUMIDITY_VALUE
    }
  }
};
const TRUTH_EMPTY: Truth = {
  timestamp: TIMESTAMP,
  providers: {}
};
const SIGNATURE_PROVIDER_ID = 'CAPTURE';
const VALID_SIGNATURE = '7163c668f0a0210b2406045eb42c5e4c9cdc2bb5904dd852813fcb3aebeb6fafa1e3af6213724764b819f0240587f5fccfadc90b537f6c4b4948801c63331c6d';
const PUBLIC_KEY = '3059301306072a8648ce3d020106082a8648ce3d0301070342000456103d481de5f8dfc854adfc4b6441d03a83f3689ac9ac85cd570293a69c321a6c11c3481db320a186c546dbc3aae62ee7783a13a7fde3e0d1f55fa0d1d79981';
const SIGNATURES_VALID: Signatures = {
  [SIGNATURE_PROVIDER_ID]: {
    signature: VALID_SIGNATURE,
    publicKey: PUBLIC_KEY
  }
};
const INVALID_SIGNATURE = '5d9192a66e2e2b4d22ce69dae407618eb6e052a86bb236bec11a7c154ffe20c0604e392378288340317d169219dfe063c504ed27ea2f47d9ec3868206b1d7f73';
const SIGNATURES_INVALID: Signatures = {
  [SIGNATURE_PROVIDER_ID]: {
    signature: INVALID_SIGNATURE,
    publicKey: PUBLIC_KEY
  }
};
