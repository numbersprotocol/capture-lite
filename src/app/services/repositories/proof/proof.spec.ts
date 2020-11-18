import { verifyWithSha256AndEcdsa$ } from 'src/app/utils/crypto/crypto';
import { MimeType } from 'src/app/utils/mime-type';
import { Assets, BinaryAsset, DefaultFactId, Proof, Signatures, Truth, UriAsset } from './proof';

describe('Proof', () => {
  let proof: Proof;

  beforeAll(() => Proof.registerSignatureProvider(
    SIGNATURE_PROVIDER_ID,
    { verify: (message, signature, publicKey) => verifyWithSha256AndEcdsa$(message, signature, publicKey).toPromise() }
  ));

  afterAll(() => Proof.unregisterSignatureProvider(SIGNATURE_PROVIDER_ID));

  it('should get the same assets with the constructor parameter', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.assets).toEqual(ASSETS);
  });

  it('should get the same truth with the constructor parameter', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.truth).toEqual(TRUTH);
  });

  it('should get the same signatures with the constructor parameter', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.signatures).toEqual(SIGNATURES_VALID);
  });

  it('should get the same timestamp with the truth in constructor', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.timestamp).toEqual(TRUTH.timestamp);
  });

  it('should get any device name when exists', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(
      proof.deviceName === DEVICE_NAME_VALUE1
      || proof.deviceName === DEVICE_NAME_VALUE2
    ).toBeTrue();
  });

  it('should get undefined when device name not exists', () => {
    proof = new Proof(ASSETS, TRUTH_EMPTY, SIGNATURES_VALID);
    expect(proof.deviceName).toBeUndefined();
  });

  it('should get any geolocation latitude when exists', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(
      proof.geolocationLatitude === GEOLOCATION_LATITUDE1
      || proof.geolocationLatitude === GEOLOCATION_LATITUDE2
    ).toBeTrue();
  });

  it('should get undefined when geolocation latitude not exists', () => {
    proof = new Proof(ASSETS, TRUTH_EMPTY, SIGNATURES_VALID);
    expect(proof.geolocationLatitude).toBeUndefined();
  });

  it('should get any geolocation longitude name when exists', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(
      proof.geolocationLongitude === GEOLOCATION_LONGITUDE1
      || proof.geolocationLongitude === GEOLOCATION_LONGITUDE2
    ).toBeTrue();
  });

  it('should get undefined when geolocation longitude not exists', () => {
    proof = new Proof(ASSETS, TRUTH_EMPTY, SIGNATURES_VALID);
    expect(proof.geolocationLongitude).toBeUndefined();
  });

  it('should get existed fact with ID', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.getFactValue(HUMIDITY)).toEqual(HUMIDITY_VALUE);
  });

  it('should get undefined with nonexistent fact ID', () => {
    const NONEXISTENT = 'NONEXISTENT';
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(proof.getFactValue(NONEXISTENT)).toBeUndefined();
  });

  it('should stringify to ordered JSON string', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    const ASSETS_DIFFERENT_ORDER: Assets = {
      [ASSET2_HASH]: ASSET2,
      [ASSET1_HASH]: {
        mimeType: ASSET1_MIMETYPE,
        binary: ASSET1_BINARY
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
    const proofWithDifferentContentsOrder = new Proof(
      ASSETS_DIFFERENT_ORDER,
      TRUTH_DIFFERENT_ORDER,
      SIGNATURES_VALID
    );
    expect(proof.stringify()).toEqual(proofWithDifferentContentsOrder.stringify());
  });

  it('should parse from stringified JSON string', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);

    const parsed = Proof.parse(proof.stringify());

    expect(parsed.assets).toEqual(ASSETS);
    expect(parsed.truth).toEqual(TRUTH);
    expect(parsed.signatures).toEqual(SIGNATURES_VALID);
  });

  it('should be verified with valid signatures', async () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expect(await proof.isVerified()).toBeTrue();
  });

  it('should not be verified with invalid signatures', async () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_INVALID);
    expect(await proof.isVerified()).toBeFalse();
  });
});

const ASSET1_HASH = '0e87c3cdb045ae9c4a10f63cc615ee4bbf0f2ff9dca6201f045a4cb276cf3122';
const ASSET1_MIMETYPE: MimeType = 'image/png';
const ASSET1_BINARY = 'iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAABAaVRYdENyZWF0aW9uIFRpbWUAAAAAADIwMjDlubTljYHkuIDmnIgxMOaXpSAo6YCx5LqMKSAyMOaZgjU55YiGMzfnp5JnJvHNAAAAFUlEQVQImWM0MTH5z4AFMGETxCsBAHRhAaHOZzVQAAAAAElFTkSuQmCC';
const ASSET1: BinaryAsset = {
  binary: ASSET1_BINARY,
  mimeType: ASSET1_MIMETYPE
};
const ASSET2_HASH = '6cb481cace19b70b1a2b927c4d3c504de810cba6f82c5372e58aee9259ba68d3';
const ASSET2: UriAsset = {
  uri: 'https://i.imgur.com/X9HrWKZ.png',
  mimeType: 'image/png'
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
const VALID_SIGNATURE = '5660e245da3cef8c5de94d692cb1999559258223e7b65c6a82e9eedaccf5b3eb6e978bba5f0dcfadd4bdf932a9f69b4bf089229294f07d5f59f2bc5807e2c3d6';
const PUBLIC_KEY = '3059301306072a8648ce3d020106082a8648ce3d030107034200049f30b0ad415a9b1f64520c6b558927fbdd9be598b2cf1ac675656cb3eee8bb553d2c38708f34bb7684fa19115d6e596c15413fa1704c61c1cb72728b287dea93';
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
