import { MimeType } from 'src/app/utils/mime-type';
import { Assets, BinaryAsset, DefaultFactId, Proof, Signatures, Truth, UriAsset } from './proof';

describe('Proof', () => {
  let proof: Proof;

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
    const TEST_TRUTH_DIFFERENT_ORDER: Truth = {
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
    const TEST_SIGNATURES_VALID_DIFFERENT_ORDER: Signatures = {
      [WEB_CRYPTO_API]: {
        publicKey: WEB_CRYPTO_API_PUBLIC_KEY,
        signature: WEB_CRYPTO_API_SIGNATURE
      },
      [ANDROID_OPEN_SSL]: {
        publicKey: ANDROID_OPEN_SSL_PUBLIC_KEY,
        signature: ANDROID_OPEN_SSL_SIGNATURE
      }
    };
    const proofWithDifferentContentsOrder = new Proof(
      ASSETS_DIFFERENT_ORDER,
      TEST_TRUTH_DIFFERENT_ORDER,
      TEST_SIGNATURES_VALID_DIFFERENT_ORDER
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

  fit('should be verified with valid signatures', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_VALID);
    expectAsync(proof.isVerified()).toBeResolved(true);
  });

  it('should not be verified with invalid signatures', () => {
    proof = new Proof(ASSETS, TRUTH, SIGNATURES_INVALID);
    expectAsync(proof.isVerified()).toBeResolved(false);
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
const ANDROID_OPEN_SSL = 'ANDROID_OPEN_SSL';
const ANDROID_OPEN_SSL_SIGNATURE = 'MEUCIATCWO3PkNlHORgQ+vVeeaRZzygoBorOcvZrMNyad8YXAiEA8iJ7NUAgcaJKUFEg1ESgtMpksNwwz4keGGk1FTlffKk=';
const ANDROID_OPEN_SSL_PUBLIC_KEY = 'MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE4IbMQvBjEqvBTUXPmPpaD7gqksL4ZOFXwG7BD5FErKyLbpouzjt+cVFoHTvreoFH5qSsBAKPJezCeVKKC2NWzg==';
const WEB_CRYPTO_API = 'WEB_CRYPTO_API';
const WEB_CRYPTO_API_SIGNATURE = 'MEUCIATCWO3PkNlHORgQ+vVeeaRZzygoBorOcvZrMNyad8YXAiEA8iJ7NUAgcaJKUFEg1ESgtMpksNwwz4keGGk1FTlffKk=';
const WEB_CRYPTO_API_PUBLIC_KEY = 'MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE4IbMQvBjEqvBTUXPmPpaD7gqksL4ZOFXwG7BD5FErKyLbpouzjt+cVFoHTvreoFH5qSsBAKPJezCeVKKC2NWzg==';
const SIGNATURES_VALID: Signatures = {
  [ANDROID_OPEN_SSL]: {
    signature: ANDROID_OPEN_SSL_SIGNATURE,
    publicKey: ANDROID_OPEN_SSL_PUBLIC_KEY
  },
  [WEB_CRYPTO_API]: {
    signature: WEB_CRYPTO_API_SIGNATURE,
    publicKey: WEB_CRYPTO_API_PUBLIC_KEY
  }
};
const SIGNATURES_INVALID: Signatures = {
  [ANDROID_OPEN_SSL]: {
    signature: ANDROID_OPEN_SSL_SIGNATURE,
    publicKey: ANDROID_OPEN_SSL_PUBLIC_KEY
  },
  [WEB_CRYPTO_API]: {
    signature: WEB_CRYPTO_API_SIGNATURE,
    publicKey: WEB_CRYPTO_API_PUBLIC_KEY
  }
};
