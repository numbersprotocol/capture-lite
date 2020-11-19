// @ts-ignore
import ImageBlobReduce from 'image-blob-reduce';
import { blobToDataUrlWithBase64$, dataUrlWithBase64ToBlob$ } from 'src/app/utils/encoding/encoding';
import { sortObjectDeeplyByKey } from 'src/app/utils/immutable/immutable';
import { sha256WithString$ } from '../../../utils/crypto/crypto';
import { MimeType } from '../../../utils/mime-type';

const imageBlobReduce = ImageBlobReduce();

/**
 * - A box containing self-verifiable data.
 * - Easy to serialize and deserialize for data persistence and interchange.
 * - Bundle all immutable information.
 * - (TODO) GETTERs might NOT good idea as it might trigger infinite loop with Angular change detection
 * - Check if proof.assets has image. If true, generate single thumb. (Should We Cache?)
 * - Generate ID from hash of stringified. (Should We Cache?)
 */
export class Proof {

  constructor(
    readonly assets: Assets,
    readonly truth: Truth,
    readonly signatures: Signatures
  ) { }

  get timestamp() { return this.truth.timestamp; }

  get deviceName() { return this.getFactValue(DefaultFactId.DEVICE_NAME); }

  get geolocationLatitude() { return this.getFactValue(DefaultFactId.GEOLOCATION_LATITUDE); }

  get geolocationLongitude() { return this.getFactValue(DefaultFactId.GEOLOCATION_LONGITUDE); }

  static signatureProviders = new Map<string, SignatureVerifier>();

  static registerSignatureProvider(id: string, provider: SignatureVerifier) {
    this.signatureProviders.set(id, provider);
  }

  static unregisterSignatureProvider(id: string) {
    this.signatureProviders.delete(id);
  }

  static parse(json: string) {
    const parsed = JSON.parse(json) as SerializedProof;
    return new Proof(parsed.assets, parsed.truth, parsed.signatures);
  }

  async getId() { return sha256WithString$(this.stringify()).toPromise(); }

  async getThumbnailDataUrl() {
    const thumbnailSize = 200;
    const imageAsset = Object.keys(this.assets).find(asset => this.assets[asset].mimeType.startsWith('image'));
    if (imageAsset === undefined) { return undefined; }
    const blob = await dataUrlWithBase64ToBlob$(`data:${this.assets[imageAsset].mimeType};base64,${imageAsset}`).toPromise();
    const thumbnailBlob = await imageBlobReduce.toBlob(blob, { max: thumbnailSize });
    return blobToDataUrlWithBase64$(thumbnailBlob).toPromise();
  }

  getFactValue(id: string) { return Object.values(this.truth.providers).find(fact => fact[id])?.[id]; }

  stringify() {
    const proofProperties: SerializedProof = {
      assets: this.assets,
      truth: this.truth,
      signatures: this.signatures
    };
    return JSON.stringify(sortObjectDeeplyByKey(proofProperties as any).toJSON());
  }

  async isVerified() {
    const signedTarget: SignedTargets = {
      assets: this.assets,
      truth: this.truth
    };
    const serializedSortedSignedTargets = JSON.stringify(sortObjectDeeplyByKey(signedTarget as any).toJSON());
    const results = await Promise.all(Object.entries(this.signatures)
      .map(([id, signature]) => Proof.signatureProviders.get(id)?.verify(
        serializedSortedSignedTargets,
        signature.signature,
        signature.publicKey
      ))
    );
    return results.every(result => result);
  }
}

export interface Assets { [base64: string]: AssetMeta; }

export interface AssetMeta {
  readonly mimeType: MimeType;
}

export interface Truth {
  readonly timestamp: number;
  readonly providers: TruthProviders;
}

interface TruthProviders { [id: string]: Facts; }

export type Facts = { [id in DefaultFactId | string]?: string | number | boolean; };

export const enum DefaultFactId {
  DEVICE_NAME = 'DEVICE_NAME',
  GEOLOCATION_LATITUDE = 'GEOLOCATION_LATITUDE',
  GEOLOCATION_LONGITUDE = 'GEOLOCATION_LONGITUDE'
}

export interface Signatures { [id: string]: Signature; }

export interface Signature {
  readonly signature: string;
  readonly publicKey: string;
}

interface SerializedProof {
  assets: Assets;
  truth: Truth;
  signatures: Signatures;
}

export type SignedTargets = Pick<SerializedProof, 'assets' | 'truth'>;

interface SignatureVerifier {
  verify(message: string, signature: string, publicKey: string): boolean | Promise<boolean>;
}
