import { flow, groupBy, mapValues } from 'lodash/fp';
import { sha256WithBase64$ } from '../../../utils/crypto/crypto';
import { blobToDataUrlWithBase64$ } from '../../../utils/encoding/encoding';
import { MimeType } from '../../../utils/mime-type';
import { Tuple } from '../../database/table/table';
import { Proof, Signature } from './proof';

/**
 * Only for migration and connection to backend. Subject to change.
 * Proof = OldProof + Information + Signatures
 * Proof can generate:
 *   1. OldProof
 *   2. Information List
 *   3. Signatures
 *   4. SortedProofInformation
 *   5. EssentialInformation List
 */

export async function getOldProof(proof: Proof): Promise<OldProof> {
  const oldProofData = Object.entries(proof.assets)[0];
  return {
    mimeType: oldProofData[1].mimeType,
    timestamp: proof.timestamp,
    hash: await sha256WithBase64$(oldProofData[0]).toPromise(),
  };
}

export async function getSortedProofInformation(
  proof: Proof
): Promise<SortedProofInformation> {
  return {
    proof: await getOldProof(proof),
    information: createSortedEssentialInformation(proof),
  };
}

function createSortedEssentialInformation(
  proof: Proof
): OldEssentialInformation[] {
  return Object.entries(proof.truth.providers)
    .flatMap(([providerId, facts]) =>
      Object.entries(facts).map(([id, value]) => ({
        provider: providerId,
        name: id,
        value: `${value}`,
      }))
    )
    .sort((a, b) => {
      const providerCompared = a.provider.localeCompare(b.provider);
      const nameCompared = a.name.localeCompare(b.name);
      const valueCompared = a.value.localeCompare(b.value);

      if (providerCompared !== 0) {
        return providerCompared;
      }
      if (nameCompared !== 0) {
        return nameCompared;
      }
      return valueCompared;
    });
}

export async function getOldSignatures(proof: Proof): Promise<OldSignature[]> {
  const assetHash = await sha256WithBase64$(
    Object.entries(proof.assets)[0][0]
  ).toPromise();
  return Object.entries(proof.signatures).map(
    ([provider, { signature, publicKey }]) => ({
      provider,
      proofHash: assetHash,
      signature,
      publicKey,
    })
  );
}

export async function getProof(
  raw: Blob,
  sortedProofInformation: SortedProofInformation,
  oldSignatures: OldSignature[]
): Promise<Proof> {
  const base64 = (await blobToDataUrlWithBase64$(raw).toPromise()).split(
    ','
  )[1];
  const groupedByProvider = groupObjectsBy(
    sortedProofInformation.information,
    'provider'
  );
  const providers = flow(
    mapValues((value: Record<string, string>[]) =>
      groupObjectsBy(value, 'name')
    ),
    mapValues((value: Record<string, { value: string }[]>) =>
      mapValues((arr: { value: string }[]) => toNumberOrBoolean(arr[0].value))(
        value
      )
    )
  )(groupedByProvider);
  const signatures = flow(
    mapValues((values: Signature[]) => ({
      signature: values[0].signature,
      publicKey: values[0].publicKey,
    }))
  )(groupObjectsBy(oldSignatures, 'provider'));

  return new Proof(
    { [base64]: { mimeType: raw.type as MimeType } },
    { timestamp: sortedProofInformation.proof.timestamp, providers },
    signatures
  );
}

/**
 * Group by the key. The returned collection does not have the original key property.
 */
function groupObjectsBy<T extends Record<string, any>>(
  objects: T[],
  key: string
): Record<string, Partial<T>[]> {
  return flow(
    groupBy(key),
    mapValues((values: T[]) =>
      values.map(value => {
        delete value[key];
        return value;
      })
    )
  )(objects);
}

function toNumberOrBoolean(str: string) {
  if (str === 'true') {
    return true;
  }
  if (str === 'false') {
    return false;
  }
  if (!Number.isNaN(Number(str))) {
    return Number(str);
  }
  return str;
}

export interface OldProof extends Tuple {
  readonly hash: string;
  readonly mimeType: MimeType;
  readonly timestamp: number;
}

export type OldEssentialInformation = Pick<
  OldInformation,
  'provider' | 'name' | 'value'
>;

export interface SortedProofInformation extends Tuple {
  readonly proof: OldProof;
  readonly information: OldEssentialInformation[];
}

export const enum OldInformationImportance {
  Low = 'low',
  High = 'high',
}

export const enum OldInformationType {
  Device = 'device',
  Location = 'location',
  Other = 'other',
}

export interface OldInformation extends Tuple {
  readonly proofHash: string;
  readonly provider: string;
  readonly name: string;
  readonly value: string;
  readonly importance: OldInformationImportance;
  readonly type: OldInformationType;
}

export const enum OldDefaultInformationName {
  DEVICE_NAME = 'Device Name',
  GEOLOCATION_LATITUDE = 'Current GPS Latitude',
  GEOLOCATION_LONGITUDE = 'Current GPS Longitude',
}

export interface OldSignature extends Tuple {
  readonly proofHash: string;
  readonly provider: string;
  readonly signature: string;
  readonly publicKey: string;
}
