import { snakeCase } from 'lodash';
import { defer, iif, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { sha256WithString } from '../../../utils/crypto/crypto';
import { sortObjectDeeplyByKey } from '../../../utils/immutable/immutable';
import { MimeType } from '../../../utils/mime-type';
import { isNonNullable } from '../../../utils/rx-operators/rx-operators';
import { Tuple } from '../../database/table/table';
import {
  MediaStore,
  OnWriteExistStrategy,
} from '../../media/media-store/media-store.service';

const RECORDER = 'Capture';
const SIGNATURE_VERSION = '2.0.0';

export class Proof {
  static signatureProviders = new Map<string, SignatureVerifier>();

  diaBackendAssetId?: string = undefined;

  isCollected = false;

  signatures: Signatures = {};

  signatureVersion?: string = undefined;

  get timestamp() {
    return this.truth.timestamp;
  }

  get deviceName() {
    return this.getFactValue<string | undefined>(DefaultFactId.DEVICE_NAME);
  }

  get geolocationLatitude() {
    return this.getFactValue<number | undefined>(
      DefaultFactId.GEOLOCATION_LATITUDE
    );
  }

  get geolocationLongitude() {
    return this.getFactValue<number | undefined>(
      DefaultFactId.GEOLOCATION_LONGITUDE
    );
  }

  readonly indexedAssets: IndexedAssets = {};

  readonly thumbnailUrl$ = defer(async () =>
    Object.entries(this.indexedAssets).find(
      ([_, meta]) =>
        meta.mimeType.startsWith('image') || meta.mimeType.startsWith('video')
    )
  ).pipe(
    concatMap(mediaAsset =>
      iif(
        () => mediaAsset === undefined,
        of(undefined),
        of(mediaAsset).pipe(
          isNonNullable(),
          concatMap(([index, assetMeta]) =>
            this.mediaStore.getThumbnailUrl$(index, assetMeta.mimeType)
          )
        )
      )
    )
  );

  constructor(
    private readonly mediaStore: MediaStore,
    readonly truth: Truth,
    signatures: Signatures = {}
  ) {
    this.signatures = signatures;
  }

  static async from(
    mediaStore: MediaStore,
    assets: Assets,
    truth: Truth,
    signatures?: Signatures
  ) {
    const proof = new Proof(mediaStore, truth, signatures);
    await proof.setAssets(assets);
    return proof;
  }

  /**
   * Create a Proof from IndexedProofView. This method should only be used when
   * you sure the Proof has already store its raw assets to MediaStore by calling
   * Proof.from() or Proof.parse() before.
   * @param mediaStore The singleton MediaStore service.
   * @param indexedProofView The view without assets with base64.
   */
  static fromIndexedProofView(
    mediaStore: MediaStore,
    indexedProofView: IndexedProofView
  ) {
    const proof = new Proof(
      mediaStore,
      indexedProofView.truth,
      indexedProofView.signatures
    );
    proof.setIndexedAssets(indexedProofView.indexedAssets);
    proof.diaBackendAssetId = indexedProofView.diaBackendAssetId;
    proof.isCollected = indexedProofView.isCollected ?? false;
    proof.signatureVersion = indexedProofView.signatureVersion;
    return proof;
  }

  static registerSignatureProvider(id: string, provider: SignatureVerifier) {
    Proof.signatureProviders.set(id, provider);
  }

  static unregisterSignatureProvider(id: string) {
    Proof.signatureProviders.delete(id);
  }

  static async parse(mediaStore: MediaStore, json: string) {
    const parsed = JSON.parse(json) as SerializedProof;
    const proof = new Proof(mediaStore, parsed.truth, parsed.signatures);
    await proof.setAssets(parsed.assets);
    return proof;
  }

  async setAssets(assets: Assets) {
    const indexedAssetEntries: [string, AssetMeta][] = [];
    for (const [base64, meta] of Object.entries(assets)) {
      const index = await this.mediaStore.write(
        base64,
        meta.mimeType,
        OnWriteExistStrategy.IGNORE
      );
      indexedAssetEntries.push([index, meta]);
    }

    this.setIndexedAssets(Object.fromEntries(indexedAssetEntries));
  }

  setIndexedAssets(indexedAssets: IndexedAssets) {
    // @ts-expect-error: initialize lazily
    this.indexedAssets = indexedAssets;
    return indexedAssets;
  }

  setSignatures(signatures: Signatures) {
    this.signatures = signatures;
    this.setSignatureVersion();
    return signatures;
  }

  setSignatureVersion() {
    this.signatureVersion = SIGNATURE_VERSION;
  }

  async getId() {
    return sha256WithString(await this.stringify());
  }

  async getAssets() {
    const assetEntries: [string, AssetMeta][] = [];
    for (const [index, meta] of Object.entries(this.indexedAssets)) {
      const base64 = await this.mediaStore.read(index);
      assetEntries.push([base64, meta]);
    }
    return Object.fromEntries(assetEntries);
  }

  async getFirstAssetUrl() {
    const [index, meta] = Object.entries(this.indexedAssets)[0];
    return this.mediaStore.getUrl(index, meta.mimeType);
  }

  async getFirstAssetMeta() {
    const asset = Object.entries(this.indexedAssets)[0];
    return asset[1];
  }

  getFactValue<T extends string | number | boolean | undefined>(id: string): T {
    return Object.values(this.truth.providers).find(fact => fact[id])?.[
      id
    ] as T;
  }

  getInformation() {
    let factEntries: [string, string | number | boolean | undefined][] = [];
    Object.values(this.truth.providers).forEach(facts => {
      const transformedFacts = Object.entries(facts).map(([key, value]) => {
        const factCategory = key.includes('GEOLOCATION')
          ? FactCategory.GEOLOCATION
          : FactCategory.DEVICE;
        return [`${snakeCase(factCategory)}.${snakeCase(key)}`, value] as [
          string,
          string | number | boolean | undefined
        ];
      });
      factEntries = factEntries.concat(transformedFacts);
    });
    return Object.fromEntries(factEntries) as Facts;
  }

  async generateSignedMessage() {
    const signedMessage: SignedMessage = {
      spec_version: SIGNATURE_VERSION,
      recorder: RECORDER,
      created_at: this.truth.timestamp,
      location_latitude: this.geolocationLatitude,
      location_longitude: this.geolocationLongitude,
      device_name: this.deviceName,
      proof_hash: Object.keys(this.indexedAssets)[0],
      asset_mime_type: (await this.getFirstAssetMeta()).mimeType,
      caption: '',
      information: this.getInformation(),
    };
    return signedMessage;
  }

  /**
   * Return the stringified Proof following the schema:
   * https://github.com/numbersprotocol/capture-lite/wiki/High-Level-Proof-Schema
   */
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
    const signedMessage: SignedMessage = await this.generateSignedMessage();
    const serializedSortedSignedMessage =
      getSerializedSortedSignedMessage(signedMessage);
    const results = await Promise.all(
      Object.entries(this.signatures).map(([id, signature]) =>
        Proof.signatureProviders
          .get(id)
          ?.verify(
            serializedSortedSignedMessage,
            signature.signature,
            signature.publicKey
          )
      )
    );
    return results.every(result => result);
  }

  getIndexedProofView(): IndexedProofView {
    return {
      indexedAssets: this.indexedAssets,
      truth: this.truth,
      signatures: this.signatures,
      signatureVersion: this.signatureVersion,
      diaBackendAssetId: this.diaBackendAssetId,
      isCollected: this.isCollected,
    };
  }

  async destroy() {
    await Promise.all(
      Object.keys(this.indexedAssets).map(index =>
        this.mediaStore.delete(index)
      )
    );
  }
}

export interface Assets {
  readonly [base64: string]: AssetMeta;
}

export interface IndexedAssets extends Tuple {
  readonly [index: string]: AssetMeta;
}

export interface AssetMeta extends Tuple {
  readonly mimeType: MimeType;
}

export interface Truth extends Tuple {
  readonly timestamp: number;
  readonly providers: TruthProviders;
}

interface TruthProviders extends Tuple {
  readonly [id: string]: Facts;
}

export interface Facts extends Tuple {
  readonly [id: string]: boolean | number | string | undefined;
}

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

export const enum FactCategory {
  DEVICE = 'device',
  GEOLOCATION = 'geolocation',
}

export interface Signatures extends Tuple {
  readonly [id: string]: Signature;
}

export interface Signature extends Tuple {
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
  readonly assets: Assets;
  readonly indexedAssets?: IndexedAssets;
  readonly truth: Truth;
  readonly signatures: Signatures;
}

export type SignedTargets = Pick<SerializedProof, 'indexedAssets' | 'truth'>;

export function getSerializedSortedSignedTargets(signedTargets: SignedTargets) {
  return JSON.stringify(sortObjectDeeplyByKey(signedTargets as any).toJSON());
}

export function getSerializedSortedSignedMessage(signedMessage: SignedMessage) {
  return JSON.stringify(sortObjectDeeplyByKey(signedMessage as any).toJSON());
}

interface SignatureVerifier {
  verify(
    message: string,
    signature: string,
    publicKey: string
  ): boolean | Promise<boolean>;
}

export interface IndexedProofView extends Tuple {
  readonly indexedAssets: IndexedAssets;
  readonly truth: Truth;
  readonly signatures: Signatures;
  readonly signatureVersion?: string;
  readonly diaBackendAssetId?: string;
  readonly isCollected?: boolean;
}

/**
 * The new signed message schema as discussed in
 * https://github.com/numbersprotocol/capture-lite/issues/779
 */
export interface SignedMessage {
  spec_version: string;
  recorder: string;
  created_at: number;
  location_latitude?: number;
  location_longitude?: number;
  device_name?: string;
  proof_hash: string;
  asset_mime_type: string;
  caption: string;
  information: Facts;
}
