import { CameraSource } from '@capacitor/camera';
import { snakeCase } from 'lodash';
import { defer, iif, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { sha256WithString } from '../../../utils/crypto/crypto';
import { sortObjectDeeplyByKey } from '../../../utils/immutable/immutable';
import { MimeType } from '../../../utils/mime-type';
import { generateIntegritySha } from '../../../utils/nit/nit';
import { isNonNullable } from '../../../utils/rx-operators/rx-operators';
import { CaptureAppWebCryptoApiSignatureProvider } from '../../collector/signature/capture-app-web-crypto-api-signature-provider/capture-app-web-crypto-api-signature-provider.service';
import { Tuple } from '../../database/table/table';
import {
  MediaStore,
  OnWriteExistStrategy,
} from '../../media/media-store/media-store.service';

export enum RecorderType {
  Capture = 'Capture',
  CaptureAppWebCryptoApiSignatureProvider = 'CaptureAppWebCryptoApiSignatureProvider',
  UploaderWebCryptoApiSignatureProvider = 'UploaderWebCryptoApiSignatureProvider',
}
const SIGNATURE_VERSION = '2.0.0';

export class Proof {
  static signatureProviders = new Map<string, SignatureVerifier>();

  diaBackendAssetId?: string = undefined;

  /**
   * When user uploades a capture we do not have option to set caption. Therefore caption is empty
   * by default. Everytime caption is updated we need to update the caption in the proof as well.
   */
  caption = '';

  /**
   * The timestamp when the asset is uploaded to the backend, in the format "2023-12-21T01:15:17Z".
   * By default, it is undefined. Once the asset is successfully uploaded, the uploadedAt property
   * will be set to the timestamp provided by the backend.
   */
  uploadedAt?: string = undefined;

  isCollected = false;

  signatures: Signatures = {};

  signatureVersion?: string = undefined;

  integritySha?: string = undefined;

  parentAssetCid?: string = undefined;

  /**
   * Since capture cam originally capture photos/videos from camera we set cameraSource to
   * CameraSource.Camera by default. If user picks photo/video from galley then cameraSource
   * should be changed to CameraSource.Photos
   */
  cameraSource: CameraSource = CameraSource.Camera;

  /**
   * Used to sort the assets in the VERIFIED tab either by timestamp or uploadedAt (if available).
   */
  get uploadedAtOrTimestamp() {
    const MILLISECONDS_PER_SECOND = 1000;
    const LENGTH_IN_MILLISECONDS = 13;

    // convert timestamp to milliseconds if needed
    const proofTimestampInMilliseconds =
      this.timestamp.toString().length === LENGTH_IN_MILLISECONDS
        ? this.timestamp
        : this.timestamp * MILLISECONDS_PER_SECOND;

    const serverTimestampInMilliseconds = Date.parse(this.uploadedAt ?? '');
    return serverTimestampInMilliseconds || proofTimestampInMilliseconds;
  }

  /**
   * The timestamp when the proof was first created or captured. Different from uploadedAt
   * The timestamp is generated using Date.now() and is represented in milliseconds.
   *
   * Note: After restoring or syncing with the backend assets, the timestamp will be in seconds.
   * For more details, refer to https://github.com/numbersprotocol/storage-backend/issues/976
   *
   * Note: Milliseconds are 13 digits long, while seconds are 10 digits long.
   */
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
    proof.caption = indexedProofView.caption ?? '';
    proof.uploadedAt = indexedProofView.uploadedAt;
    proof.isCollected = indexedProofView.isCollected ?? false;
    proof.signatureVersion = indexedProofView.signatureVersion;
    proof.integritySha = indexedProofView.integritySha;
    proof.parentAssetCid = indexedProofView.parentAssetCid;
    proof.cameraSource = indexedProofView.cameraSource;
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

  setIntegritySha(integritySha: string) {
    this.integritySha = integritySha;
    return integritySha;
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

  /**
   * Generates a signed message with the provided recorder type.
   *
   * @param recorderType - The type of recorder used for signing the message
   * (default is RecorderType.CAPTURE). Related discussion comments:
   * - https://github.com/numbersprotocol/capture-lite/issues/779#issuecomment-880330292
   * - https://app.asana.com/0/0/1204012493522134/1204289040001270/f
   * @returns A promise that resolves to the generated signed message
   */
  async generateProofMetadata(
    recorder: RecorderType = RecorderType.Capture
  ): Promise<ProofMetadata> {
    const ProofMetadata: ProofMetadata = {
      spec_version: SIGNATURE_VERSION,
      recorder: recorder,
      created_at: this.truth.timestamp,
      location_latitude: this.geolocationLatitude,
      location_longitude: this.geolocationLongitude,
      device_name: this.deviceName,
      proof_hash: Object.keys(this.indexedAssets)[0],
      asset_mime_type: (await this.getFirstAssetMeta()).mimeType,
      caption: '',
      information: this.getInformation(),
    };
    return ProofMetadata;
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
    const recorder = CaptureAppWebCryptoApiSignatureProvider.recorderFor(
      this.cameraSource
    );
    const proofMetadata: ProofMetadata = await this.generateProofMetadata(
      recorder
    );
    const integritySha = await generateIntegritySha(proofMetadata);
    const results = await Promise.all(
      Object.entries(this.signatures).map(([id, signature]) =>
        Proof.signatureProviders
          .get(id)
          ?.verify(integritySha, signature.signature, signature.publicKey)
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
      caption: this.caption,
      uploadedAt: this.uploadedAt,
      isCollected: this.isCollected,
      integritySha: this.integritySha,
      parentAssetCid: this.parentAssetCid,
      cameraSource: this.cameraSource,
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

export interface SignResult extends Tuple {
  readonly signatures: Signatures;
  readonly integritySha: string;
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

export function getSerializedSortedProofMetadata(ProofMetadata: ProofMetadata) {
  const indent = 2;
  return JSON.stringify(
    sortObjectDeeplyByKey(ProofMetadata as any).toJSON(),
    null,
    indent
  );
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
  readonly caption?: string;
  readonly uploadedAt?: string;
  readonly isCollected?: boolean;
  readonly integritySha?: string;
  readonly parentAssetCid?: string;
  readonly cameraSource: CameraSource;
}

/**
 * The new signed message schema as discussed in
 * https://github.com/numbersprotocol/capture-lite/issues/779
 */
export interface ProofMetadata {
  spec_version: string;
  recorder: RecorderType;
  created_at: number;
  location_latitude?: number;
  location_longitude?: number;
  device_name?: string;
  proof_hash: string;
  asset_mime_type: string;
  caption: string;
  information: Facts;
}
