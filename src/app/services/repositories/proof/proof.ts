import { MimeType } from 'src/app/utils/mime-type';

/**
 * 1. A box containing self-verifiable info.
 * 2. Easy to serialize and deserialize for data persistence and interchange.
 * 3. Bundle all immutable information.
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

  getFactValue(id: string) { return Object.values(this.truth.providers).find(fact => fact[id])?.[id]; }

  get isVerified() {
    throw new Error('Not yet implemented.');
    return false;
  }
}

export interface Assets { [hash: string]: BinaryAsset | UriAsset; }

interface BinaryAsset {
  binary: string;
  mimeType: MimeType;
}

interface UriAsset {
  uri: string;
  mimeType: MimeType;
}

export interface Truth {
  timestamp: number;
  providers: TruthProviders;
}

interface TruthProviders { [id: string]: Fact; }

type Fact = { [id in DefaultFactId | string]?: string | number | boolean; };

export const enum DefaultFactId {
  DEVICE_NAME = 'DEVICE_NAME',
  GEOLOCATION_LATITUDE = 'GEOLOCATION_LATITUDE',
  GEOLOCATION_LONGITUDE = 'GEOLOCATION_LONGITUDE'
}

export interface Signatures { [id: string]: Signature; }

interface Signature {
  signature: string;
  publicKey: string;
}
