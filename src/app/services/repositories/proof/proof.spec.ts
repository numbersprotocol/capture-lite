import { Assets, DefaultFactId, Proof, Signatures, Truth } from './proof';

fdescribe('Proof', () => {
  let proof: Proof;

  it('should get the same assets with the constructor parameter', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_VALID);
    expect(proof.assets).toEqual(TEST_ASSETS);
  });

  it('should get the same truth with the constructor parameter', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_VALID);
    expect(proof.truth).toEqual(TEST_TRUTH);
  });

  it('should get the same signatures with the constructor parameter', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_VALID);
    expect(proof.signatures).toEqual(TEST_SIGNATURES_VALID);
  });

  it('should get the same timestamp with the truth in constructor', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_VALID);
    expect(proof.timestamp).toEqual(TEST_TRUTH.timestamp);
  });

  it('should get any device name when exists', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_VALID);
    expect(
      proof.deviceName === DEVICE_NAME_VALUE1
      || proof.deviceName === DEVICE_NAME_VALUE2
    ).toBeTrue();
  });

  it('should get undefined when device name not exists', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH_EMPTY, TEST_SIGNATURES_VALID);
    expect(proof.deviceName).toBeUndefined();
  });

  it('should get any geolocation latitude when exists', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_VALID);
    expect(
      proof.geolocationLatitude === GEOLOCATION_LATITUDE1
      || proof.geolocationLatitude === GEOLOCATION_LATITUDE2
    ).toBeTrue();
  });

  it('should get undefined when geolocation latitude not exists', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH_EMPTY, TEST_SIGNATURES_VALID);
    expect(proof.geolocationLatitude).toBeUndefined();
  });

  it('should get any geolocation longitude name when exists', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_VALID);
    expect(
      proof.geolocationLongitude === GEOLOCATION_LONGITUDE1
      || proof.geolocationLongitude === GEOLOCATION_LONGITUDE2
    ).toBeTrue();
  });

  it('should get undefined when geolocation longitude not exists', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH_EMPTY, TEST_SIGNATURES_VALID);
    expect(proof.geolocationLongitude).toBeUndefined();
  });

  it('should get existed fact with ID', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_VALID);
    expect(proof.getFactValue(HUMIDITY)).toEqual(HUMIDITY_VALUE);
  });

  it('should get undefined with nonexistent fact ID', () => {
    const NONEXISTENT = 'NONEXISTENT';
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_VALID);
    expect(proof.getFactValue(NONEXISTENT)).toBeUndefined();
  });

  it('should be verified with valid signatures', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_VALID);
    expect(proof.isVerified).toBeTrue();
  });

  it('should not be verified with invalid signatures', () => {
    proof = new Proof(TEST_ASSETS, TEST_TRUTH, TEST_SIGNATURES_INVALID);
    expect(proof.isVerified).toBeFalse();
  });
});

const TEST_ASSETS: Assets = {
  '0e87c3cdb045ae9c4a10f63cc615ee4bbf0f2ff9dca6201f045a4cb276cf3122': {
    binary: 'iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAABAaVRYdENyZWF0aW9uIFRpbWUAAAAAADIwMjDlubTljYHkuIDmnIgxMOaXpSAo6YCx5LqMKSAyMOaZgjU55YiGMzfnp5JnJvHNAAAAFUlEQVQImWM0MTH5z4AFMGETxCsBAHRhAaHOZzVQAAAAAElFTkSuQmCC',
    mimeType: 'image/png'
  },
  '6cb481cace19b70b1a2b927c4d3c504de810cba6f82c5372e58aee9259ba68d3': {
    uri: 'https://i.imgur.com/X9HrWKZ.png',
    mimeType: 'image/png'
  }
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
const TEST_TRUTH: Truth = {
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
      [HUMIDITY]: HUMIDITY_VALUE
    }
  }
};
const TEST_TRUTH_EMPTY: Truth = {
  timestamp: TIMESTAMP,
  providers: {}
};
const ANDROID_OPEN_SSL = 'ANDROID_OPEN_SSL';
const TEST_SIGNATURES_VALID: Signatures = {
  [ANDROID_OPEN_SSL]: {
    signature: 'MEUCIATCWO3PkNlHORgQ+vVeeaRZzygoBorOcvZrMNyad8YXAiEA8iJ7NUAgcaJKUFEg1ESgtMpksNwwz4keGGk1FTlffKk=',
    publicKey: 'MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE4IbMQvBjEqvBTUXPmPpaD7gqksL4ZOFXwG7BD5FErKyLbpouzjt+cVFoHTvreoFH5qSsBAKPJezCeVKKC2NWzg=='
  }
};
const TEST_SIGNATURES_INVALID: Signatures = {
  [ANDROID_OPEN_SSL]: {
    signature: 'MEUCIATCWO3PkNlHORgQ+vVeeaRZzygoBorOcvZrMNyad8YXAiEA8iJ7NUAgcaJKUFEg1ESgtMpksNwwz4keGGk1FTlffKk=',
    publicKey: 'MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAE4IbMQvBjEqvBTUXPmPpaD7gqksL4ZOFXwG7BD5FErKyLbpouzjt+cVFoHTvreoFH5qSsBAKPJezCeVKKC2NWzg=='
  }
};
