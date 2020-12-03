import ImageBlobReduce from 'image-blob-reduce';
import { sha256WithString } from '../../../utils/crypto/crypto';
import { base64ToBlob, blobToBase64 } from '../../../utils/encoding/encoding';
import { sortObjectDeeplyByKey } from '../../../utils/immutable/immutable';
import { MimeType } from '../../../utils/mime-type';
import { FileStore } from '../../file-store/file-store.service';

const imageBlobReduce = new ImageBlobReduce();

/**
 * - A box containing self-verifiable data.
 * - Easy to serialize and deserialize for data persistence and interchange.
 * - Bundle all immutable information.
 * - Check if proof.assets has image. If true, generate single thumb. (Should We Cache?)
 * - Generate and ID from hash of stringified.
 */
export class Proof {
  get timestamp() {
    return this.truth.timestamp;
  }

  get deviceName() {
    return this.getFactValue(DefaultFactId.DEVICE_NAME);
  }

  get geolocationLatitude() {
    return this.getFactValue(DefaultFactId.GEOLOCATION_LATITUDE);
  }

  get geolocationLongitude() {
    return this.getFactValue(DefaultFactId.GEOLOCATION_LONGITUDE);
  }
  readonly indexedAssets: IndexedAssets = {};

  private constructor(
    private readonly fileStore: FileStore,
    readonly truth: Truth,
    readonly signatures: Signatures
  ) {}

  private async setAssets(assets: Assets) {
    const indexedAssetEntries: [string, AssetMeta][] = [];
    for (const [base64, meta] of Object.entries(assets)) {
      const index = await this.fileStore.write(base64);
      indexedAssetEntries.push([index, meta]);
    }
    // @ts-ignore
    this.indexedAssets = Object.fromEntries(indexedAssetEntries);
  }

  async getId() {
    return sha256WithString(await this.stringify());
  }

  async getAssets() {
    const assetEntries: [string, AssetMeta][] = [];
    for (const [index, meta] of Object.entries(this.indexedAssets)) {
      const base64 = await this.fileStore.read(index);
      assetEntries.push([base64, meta]);
    }
    return Object.fromEntries(assetEntries);
  }

  async getThumbnailBase64() {
    const thumbnailSize = 200;
    const imageAssetIndex = Object.keys(this.indexedAssets).find(index =>
      this.indexedAssets[index].mimeType.startsWith('image')
    );
    if (imageAssetIndex === undefined) {
      return undefined;
    }
    const blob = await base64ToBlob(
      await this.fileStore.read(imageAssetIndex),
      this.indexedAssets[imageAssetIndex].mimeType
    );
    const thumbnailBlob = await imageBlobReduce.toBlob(blob, {
      max: thumbnailSize,
    });
    return blobToBase64(thumbnailBlob);
  }

  getFactValue(id: string) {
    return Object.values(this.truth.providers).find(fact => fact[id])?.[id];
  }

  async stringify() {
    const proofProperties: SerializedProof = {
      assets: await this.getAssets(),
      truth: this.truth,
      signatures: this.signatures,
    };
    return JSON.stringify(
      sortObjectDeeplyByKey(proofProperties as any).toJSON()
    );
  }

  async isVerified() {
    const signedTargets: SignedTargets = {
      assets: await this.getAssets(),
      truth: this.truth,
    };
    const serializedSortedSignedTargets = getSerializedSortedSignedTargets(
      signedTargets
    );
    const results = await Promise.all(
      Object.entries(this.signatures).map(([id, signature]) =>
        Proof.signatureProviders
          .get(id)
          ?.verify(
            serializedSortedSignedTargets,
            signature.signature,
            signature.publicKey
          )
      )
    );
    return results.every(result => result);
  }

  static signatureProviders = new Map<string, SignatureVerifier>();

  static async from(
    fileStore: FileStore,
    assets: Assets,
    truth: Truth,
    signatures: Signatures
  ) {
    const proof = new Proof(fileStore, truth, signatures);
    await proof.setAssets(assets);
    return proof;
  }

  static registerSignatureProvider(id: string, provider: SignatureVerifier) {
    Proof.signatureProviders.set(id, provider);
  }

  static unregisterSignatureProvider(id: string) {
    Proof.signatureProviders.delete(id);
  }

  static async parse(fileStore: FileStore, json: string) {
    const parsed = JSON.parse(json) as SerializedProof;
    const proof = new Proof(fileStore, parsed.truth, parsed.signatures);
    await proof.setAssets(parsed.assets);
    return proof;
  }
}

export interface Assets {
  [base64: string]: AssetMeta;
}

interface IndexedAssets {
  [index: string]: AssetMeta;
}

export interface AssetMeta {
  readonly mimeType: MimeType;
}

export interface Truth {
  readonly timestamp: number;
  readonly providers: TruthProviders;
}

interface TruthProviders {
  [id: string]: Facts;
}

export type Facts = {
  [id in DefaultFactId | string]: boolean | number | string | undefined;
};

export function isFacts(value: any): value is Facts {
  if (!(value instanceof Object)) {
    return false;
  }
  if (
    Object.values(value).some(
      v =>
        typeof v !== 'boolean' &&
        typeof v !== 'number' &&
        typeof v !== 'string' &&
        typeof v !== 'undefined'
    )
  ) {
    return false;
  }
  return true;
}

export const enum DefaultFactId {
  DEVICE_NAME = 'DEVICE_NAME',
  GEOLOCATION_LATITUDE = 'GEOLOCATION_LATITUDE',
  GEOLOCATION_LONGITUDE = 'GEOLOCATION_LONGITUDE',
}

export interface Signatures {
  [id: string]: Signature;
}

export interface Signature {
  readonly signature: string;
  readonly publicKey: string;
}

export function isSignature(value: any): value is Signature {
  if (!(value instanceof Object)) {
    return false;
  }
  if (
    !value.signature ||
    !value.publicKey ||
    typeof value.signature !== 'string' ||
    typeof value.publicKey !== 'string'
  ) {
    return false;
  }
  return true;
}

interface SerializedProof {
  assets: Assets;
  truth: Truth;
  signatures: Signatures;
}

export type SignedTargets = Pick<SerializedProof, 'assets' | 'truth'>;

export function getSerializedSortedSignedTargets(signedTargets: SignedTargets) {
  return JSON.stringify(sortObjectDeeplyByKey(signedTargets as any).toJSON());
}

interface SignatureVerifier {
  verify(
    message: string,
    signature: string,
    publicKey: string
  ): boolean | Promise<boolean>;
}
