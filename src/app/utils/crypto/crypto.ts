import { defer, Observable, of, zip } from 'rxjs';
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
const KEY_FORMAT = 'jwk';

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

export function createEcKeyPair$(): Observable<KeyPair> {
  return defer(() => subtle.generateKey(
    {
      name: ECDSA,
      namedCurve: SECP256R1
    },
    true,
    [Usage.Sign, Usage.Verify]
  )).pipe(
    switchMap(({ publicKey, privateKey }) => zip(exportKey$(publicKey), exportKey$(privateKey))),
    map(([publicKey, privateKey]) => ({ publicKey, privateKey }))
  );
}

export function signWithSha256AndEcdsa$(message: string, privateKeyHex: string) {
  return importKey$(privateKeyHex, { name: ECDSA, namedCurve: SECP256R1 }, [Usage.Sign]).pipe(
    switchMap(key => subtle.sign({ name: ECDSA, hash: SHA_256 }, key, stringToArrayBuffer(message))),
    map(signature => arrayBufferToHex(signature))
  );
}

export function verifyWithSha256AndEcdsa$(message: string, signatureHex: string, publicKeyHex: string) {
  return importKey$(publicKeyHex, { name: ECDSA, namedCurve: SECP256R1 }, [Usage.Verify]).pipe(
    switchMap(key => subtle.verify(
      { name: ECDSA, hash: SHA_256 },
      key,
      hexToArrayBuffer(signatureHex),
      stringToArrayBuffer(message)
    ))
  );
}

function exportKey$(key: CryptoKey) {
  return defer(() => subtle.exportKey(KEY_FORMAT, key)).pipe(
    map(exported => JSON.stringify(exported))
  );
}

function importKey$(
  keyInJwk: string,
  algorithm: string | AesKeyAlgorithm | EcKeyImportParams | HmacImportParams | RsaHashedImportParams | DhImportKeyParams,
  keyUsages: KeyUsage[]
) {
  return defer(() => subtle.importKey(
    KEY_FORMAT,
    JSON.parse(keyInJwk),
    algorithm,
    true,
    keyUsages
  ));
}
