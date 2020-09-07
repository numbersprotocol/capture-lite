import { defer, of, zip } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { arrayBufferToHex, base64ToArrayBuffer, hexToArrayBuffer, stringToArrayBuffer } from '../encoding/encoding';

const subtle = crypto.subtle;
const SHA_256 = 'SHA-256';
const ECDSA = 'ECDSA';
const SECP256R1 = 'P-256';
const enum Usage {
  Sign = 'sign',
  Verify = 'verify'
}
const enum Format {
  PKCS8 = 'pkcs8',
  SubjectPublicKeyInfo = 'spki'
}

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export function sha256$<T extends object>(object: T) {
  return of(JSON.stringify(object)).pipe(
    switchMap(json => sha256WithString$(json))
  );
}

export function sha256WithString$(str: string) {
  return of(new TextEncoder().encode(str).buffer).pipe(
    switchMap(arrayBuffer => subtle.digest(SHA_256, arrayBuffer)),
    map(digested => arrayBufferToHex(digested))
  );
}

export function sha256WithBase64$(base64: string) {
  return of(base64ToArrayBuffer(base64)).pipe(
    switchMap(arrayBuffer => subtle.digest(SHA_256, arrayBuffer)),
    map(digested => arrayBufferToHex(digested))
  );
}

export function createEcKeyPair$() {
  return defer(() => subtle.generateKey(
    {
      name: ECDSA,
      namedCurve: SECP256R1
    },
    true,
    [Usage.Sign, Usage.Verify]
  )).pipe(
    switchMap(({ publicKey, privateKey }) => zip(exportEcdsaPublicKey$(publicKey), exportEcdsaPrivateKey$(privateKey))),
    map(([publicKey, privateKey]) => ({ publicKey, privateKey } as KeyPair))
  );
}

export function signWithSha256AndEcdsa$(message: string, privateKeyHex: string) {
  return importEcdsaPrivateKey$(privateKeyHex).pipe(
    switchMap(key => subtle.sign({ name: ECDSA, hash: SHA_256 }, key, stringToArrayBuffer(message))),
    map(signature => arrayBufferToHex(signature))
  );
}

export function verifyWithSha256AndEcdsa$(message: string, signatureHex: string, publicKeyHex: string) {
  return importEcdsaPublicKey$(publicKeyHex).pipe(
    switchMap(key => subtle.verify(
      { name: ECDSA, hash: SHA_256 },
      key,
      hexToArrayBuffer(signatureHex),
      stringToArrayBuffer(message)
    ))
  );
}

function exportEcdsaPublicKey$(key: CryptoKey) {
  return defer(() => subtle.exportKey(Format.SubjectPublicKeyInfo, key)).pipe(
    map(arrayBuffer => arrayBufferToHex(arrayBuffer))
  );
}

function exportEcdsaPrivateKey$(key: CryptoKey) {
  return defer(() => subtle.exportKey(Format.PKCS8, key)).pipe(
    map(arrayBuffer => arrayBufferToHex(arrayBuffer))
  );
}

function importEcdsaPublicKey$(keyHex: string) {
  return defer(() => subtle.importKey(
    Format.SubjectPublicKeyInfo,
    hexToArrayBuffer(keyHex),
    {
      name: ECDSA,
      hash: SHA_256,
      namedCurve: SECP256R1
    },
    true,
    [Usage.Verify]
  ));
}

function importEcdsaPrivateKey$(keyHex: string) {
  return defer(() => subtle.importKey(
    Format.PKCS8,
    hexToArrayBuffer(keyHex),
    {
      name: ECDSA,
      hash: SHA_256,
      namedCurve: SECP256R1
    },
    true,
    [Usage.Sign]
  ));
}
