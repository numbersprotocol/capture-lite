import _ from 'lodash';
import { sha256WithBase64$ } from 'src/app/utils/crypto/crypto';
import { blobToDataUrlWithBase64$ } from 'src/app/utils/encoding/encoding';
import { MimeType } from 'src/app/utils/mime-type';
import { Tuple } from '../../database/table/table';
import { Information } from '../information/information';
import { OldSignature } from '../signature/signature';
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
    hash: await sha256WithBase64$(oldProofData[0]).toPromise()
  };
}

export async function getSortedProofInformation(proof: Proof): Promise<SortedProofInformation> {
  return {
    proof: await getOldProof(proof),
    information: createSortedProofInformation(proof)
  };
}

function createSortedProofInformation(proof: Proof) {
  return Object.entries(proof.truth.providers)
    .flatMap(([providerId, facts]) => Object.entries(facts).map(([id, value]) => ({
      provider: providerId,
      name: id,
      value: `${value}`
    } as EssentialInformation))).sort((a, b) => {
      const providerCompared = a.provider.localeCompare(b.provider);
      const nameCompared = a.name.localeCompare(b.name);
      const valueCompared = a.value.localeCompare(b.value);

      if (providerCompared !== 0) { return providerCompared; }
      if (nameCompared !== 0) { return nameCompared; }
      return valueCompared;
    });
}

export async function getOldSignatures(proof: Proof): Promise<OldSignature[]> {
  const assetHash = await sha256WithBase64$(Object.entries(proof.assets)[0][0]).toPromise();
  return Object.entries(proof.signatures)
    .map(([provider, { signature, publicKey }]) => ({ provider, proofHash: assetHash, signature, publicKey }));
}

export async function getProof(
  raw: Blob,
  sortedProofInformation: SortedProofInformation,
  oldSignatures: OldSignature[]): Promise<Proof> {
  const base64 = (await blobToDataUrlWithBase64$(raw).toPromise()).split(',')[1];
  const groupedByProvider = groupObjectsBy(sortedProofInformation.information, 'provider');
  const providers = _.mapValues(groupedByProvider, values =>
    _.mapValues(groupObjectsBy(values, 'name'), (v: { value: string; }[]) => toNumberOrBoolean(v[0].value))
  );
  const signatures = _.mapValues(groupObjectsBy(oldSignatures, 'provider'), (values: Signature[]) =>
    ({ signature: values[0].signature, publicKey: values[0].publicKey })
  );

  return new Proof(
    { [base64]: { mimeType: raw.type as MimeType } },
    { timestamp: sortedProofInformation.proof.timestamp, providers },
    signatures
  );
}

/**
 * Group by the key. The returned collection does not have the original key property.
 */
function groupObjectsBy(obj: object, key: string) {
  return _.mapValues(_.groupBy(obj, key), values => values.map(value => {
    delete value[key];
    return value;
  }));
}

function toNumberOrBoolean(str: string) {
  if (str === 'true') { return true; }
  if (str === 'false') { return false; }
  if (!Number.isNaN(Number(str))) { return Number(str); }
  return str;
}

export interface OldProof extends Tuple {
  readonly hash: string;
  readonly mimeType: MimeType;
  readonly timestamp: number;
}

export type EssentialInformation = Pick<Information, 'provider' | 'name' | 'value'>;

export interface SortedProofInformation extends Tuple {
  readonly proof: OldProof;
  readonly information: EssentialInformation[];
}
