import { defer, Observable, of, zip } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  arrayBufferToHex,
  base64ToArrayBuffer,
  hexToArrayBuffer,
  stringToArrayBuffer,
} from '../encoding/encoding';

const subtle = crypto.subtle;
const SHA_256 = 'SHA-256';
const ECDSA = 'ECDSA';
const SECP256R1 = 'P-256';
const enum Usage {
  Sign = 'sign',
  Verify = 'verify',
}
const enum Format {
  PKCS8 = 'pkcs8',
  SubjectPublicKeyInfo = 'spki',
}

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

/**
 * Use SHA-256 to hash the object.
 * @param object The target object. Note that the order of the object properties is sensitive.
 */
export function sha256$<T extends object>(object: T) {
  return of(JSON.stringify(object)).pipe(switchMap(sha256WithString$));
}

export function sha256WithString$(str: string) {
  return of(new TextEncoder().encode(str).buffer).pipe(
    switchMap(arrayBuffer => subtle.digest(SHA_256, arrayBuffer)),
    map(arrayBufferToHex)
  );
}

export function sha256WithBase64$(base64: string) {
  return of(base64ToArrayBuffer(base64)).pipe(
    switchMap(arrayBuffer => subtle.digest(SHA_256, arrayBuffer)),
    map(arrayBufferToHex)
  );
}

export function createEcKeyPair$(): Observable<KeyPair> {
  return defer(() =>
    subtle.generateKey(
      {
        name: ECDSA,
        namedCurve: SECP256R1,
      },
      true,
      [Usage.Sign, Usage.Verify]
    )
  ).pipe(
    switchMap(({ publicKey, privateKey }) =>
      zip(exportEcdsaPublicKey$(publicKey), exportEcdsaPrivateKey$(privateKey))
    ),
    map(([publicKey, privateKey]) => ({ publicKey, privateKey }))
  );
}

export function signWithSha256AndEcdsa$(
  message: string,
  privateKeyHex: string
) {
  return importEcdsaPrivateKey$(privateKeyHex).pipe(
    switchMap(key =>
      subtle.sign(
        { name: ECDSA, hash: SHA_256 },
        key,
        stringToArrayBuffer(message)
      )
    ),
    map(arrayBufferToHex)
  );
}

export function verifyWithSha256AndEcdsa$(
  message: string,
  signatureHex: string,
  publicKeyHex: string
) {
  return importEcdsaPublicKey$(publicKeyHex).pipe(
    switchMap(key =>
      subtle.verify(
        { name: ECDSA, hash: SHA_256 },
        key,
        hexToArrayBuffer(signatureHex),
        stringToArrayBuffer(message)
      )
    )
  );
}

function exportEcdsaPublicKey$(key: CryptoKey) {
  return defer(() => subtle.exportKey(Format.SubjectPublicKeyInfo, key)).pipe(
    map(arrayBufferToHex)
  );
}

function exportEcdsaPrivateKey$(key: CryptoKey) {
  return defer(() => subtle.exportKey(Format.PKCS8, key)).pipe(
    map(arrayBufferToHex)
  );
}

function importEcdsaPublicKey$(keyHex: string) {
  return defer(() =>
    subtle.importKey(
      Format.SubjectPublicKeyInfo,
      hexToArrayBuffer(keyHex),
      {
        name: ECDSA,
        hash: SHA_256,
        namedCurve: SECP256R1,
      },
      true,
      [Usage.Verify]
    )
  );
}

function importEcdsaPrivateKey$(keyHex: string) {
  return defer(() =>
    subtle.importKey(
      Format.PKCS8,
      hexToArrayBuffer(keyHex),
      {
        name: ECDSA,
        hash: SHA_256,
        namedCurve: SECP256R1,
      },
      true,
      [Usage.Sign]
    )
  );
}
