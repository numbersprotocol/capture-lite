import { dataUrlWithBase64ToBlob$ } from 'src/app/utils/encoding/encoding';
import { MimeType } from '../../../utils/mime-type';
import { AssetMeta, Assets, DefaultFactId, Proof, Signatures, Truth } from '../proof/proof';
import { OldSignature } from '../signature/signature';
import { getOldProof, getOldSignatures, getProof, getSortedProofInformation, SortedProofInformation } from './old-proof-adapter';

describe('old-proof-adapter', () => {
  let proof: Proof;

  beforeEach(() => proof = new Proof(ASSETS, TRUTH, SIGNATURES));

  it('should convert Proof to OldProof', async () => {
    const oldProof = await getOldProof(proof);

    expect(oldProof.hash).toEqual(ASSET1_SHA256);
    expect(oldProof.mimeType).toEqual(ASSET1_MIMETYPE);
    expect(oldProof.timestamp).toEqual(TRUTH.timestamp);
  });

  it('should convert Proof SortedProofInformation', async () => {
    const sortedProofInformation = await getSortedProofInformation(proof);

    expect(sortedProofInformation.proof.hash).toEqual(ASSET1_SHA256);
    expect(sortedProofInformation.proof.mimeType).toEqual(ASSET1_MIMETYPE);
    expect(sortedProofInformation.proof.timestamp).toEqual(TRUTH.timestamp);
    sortedProofInformation.information.forEach(({ provider, name }) => {
      expect(Object.keys(proof.truth.providers).includes(provider)).toBeTrue();
      expect(
        Object.values(proof.truth.providers)
          .flatMap(facts => Object.keys(facts))
          .includes(name)
      ).toBeTrue();
    });
  });

  it('should convert Proof to OldSignatures', async () => {
    const oldSignatures = await getOldSignatures(proof);

    expect(oldSignatures.length).toEqual(1);
    expect(oldSignatures[0].proofHash).toEqual(ASSET1_SHA256);
    expect(oldSignatures[0].provider).toEqual(SIGNATURE_PROVIDER_ID);
    expect(oldSignatures[0].publicKey).toEqual(PUBLIC_KEY);
    expect(oldSignatures[0].signature).toEqual(VALID_SIGNATURE);
  });

  it('should convert SortedProofInformation with raw Blob to Proof', async () => {
    const blob = await dataUrlWithBase64ToBlob$(`data:${ASSET1_MIMETYPE};base64,${ASSET1_BASE64}`).toPromise();
    const convertedProof = await getProof(blob, SORTED_PROOF_INFORMATION, OLD_SIGNATURES);

    const assetEntries = Object.entries(convertedProof.assets);
    expect(assetEntries.length).toEqual(1);
    expect(assetEntries[0][0]).toEqual(ASSET1_BASE64);
    expect(assetEntries[0][1].mimeType).toEqual(ASSET1_MIMETYPE);
    expect(convertedProof.timestamp).toEqual(TRUTH.timestamp);
    expect(convertedProof.deviceName).toEqual(DEVICE_NAME_VALUE1);
    expect(convertedProof.geolocationLatitude).toEqual(GEOLOCATION_LATITUDE1);
    expect(convertedProof.geolocationLongitude).toEqual(GEOLOCATION_LONGITUDE1);
    expect(convertedProof.truth.providers[HUMIDITY]).toBeUndefined();
    expect(convertedProof.signatures).toEqual(SIGNATURES);
  });
});

const ASSET1_MIMETYPE: MimeType = 'image/png';
const ASSET1_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAYAAAADCAYAAACwAX77AAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAABAaVRYdENyZWF0aW9uIFRpbWUAAAAAADIwMjDlubTljYHkuIDmnIgxMOaXpSAo6YCx5LqMKSAyMOaZgjU55YiGMzfnp5JnJvHNAAAAFUlEQVQImWM0MTH5z4AFMGETxCsBAHRhAaHOZzVQAAAAAElFTkSuQmCC';
const ASSET1_SHA256 = '0e87c3cdb045ae9c4a10f63cc615ee4bbf0f2ff9dca6201f045a4cb276cf3122';
const ASSET1_META: AssetMeta = { mimeType: ASSET1_MIMETYPE };
const ASSET2_MIMETYPE: MimeType = 'image/png';
const ASSET2_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAABHNCSVQICAgIfAhkiAAAABZJREFUCJlj/Pnz538GJMDEgAYICwAAAbkD8p660MIAAAAASUVORK5CYII=';
const ASSET2_META: AssetMeta = { mimeType: ASSET2_MIMETYPE };
const ASSETS: Assets = {
  [ASSET1_BASE64]: ASSET1_META,
  [ASSET2_BASE64]: ASSET2_META
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
const SIGNATURE_PROVIDER_ID = 'CAPTURE';
const VALID_SIGNATURE = '575cbd72438eec799ffc5d78b45d968b65fd4597744d2127cd21556ceb63dff4a94f409d87de8d1f554025efdf56b8445d8d18e661b79754a25f45d05f4e26ac';
const PUBLIC_KEY = '3059301306072a8648ce3d020106082a8648ce3d03010703420004bc23d419027e59bf1eb94c18bfa4ab5fb6ca8ae83c94dbac5bfdfac39ac8ae16484e23b4d522906c4cd8c7cb1a34cd820fb8d065e1b32c8a28320a68fff243f8';
const SIGNATURES: Signatures = {
  [SIGNATURE_PROVIDER_ID]: {
    signature: VALID_SIGNATURE,
    publicKey: PUBLIC_KEY
  }
};
const SORTED_PROOF_INFORMATION: SortedProofInformation = {
  proof: {
    hash: ASSET1_SHA256,
    mimeType: ASSET1_MIMETYPE,
    timestamp: TRUTH.timestamp
  },
  information: [
    {
      provider: INFO_SNAPSHOT,
      name: DefaultFactId.GEOLOCATION_LATITUDE,
      value: `${GEOLOCATION_LATITUDE1}`
    },
    {
      provider: INFO_SNAPSHOT,
      name: DefaultFactId.GEOLOCATION_LONGITUDE,
      value: `${GEOLOCATION_LONGITUDE1}`
    },
    {
      provider: INFO_SNAPSHOT,
      name: DefaultFactId.DEVICE_NAME,
      value: `${DEVICE_NAME_VALUE1}`
    },
    {
      provider: CAPACITOR,
      name: DefaultFactId.GEOLOCATION_LATITUDE,
      value: `${GEOLOCATION_LATITUDE2}`
    },
    {
      provider: CAPACITOR,
      name: DefaultFactId.GEOLOCATION_LONGITUDE,
      value: `${GEOLOCATION_LATITUDE2}`
    },
    {
      provider: CAPACITOR,
      name: DefaultFactId.DEVICE_NAME,
      value: `${DEVICE_NAME_VALUE2}`
    },
    {
      provider: CAPACITOR,
      name: HUMIDITY,
      value: `${HUMIDITY_VALUE}`
    }
  ]
};
const OLD_SIGNATURES: OldSignature[] = [{
  provider: SIGNATURE_PROVIDER_ID,
  signature: VALID_SIGNATURE,
  publicKey: PUBLIC_KEY,
  proofHash: ASSET1_SHA256
}];
