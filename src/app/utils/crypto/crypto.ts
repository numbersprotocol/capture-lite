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
  readonly publicKey: string;
  readonly privateKey: string;
}

export async function sha256WithString(str: string) {
  const arrayBuffer = new TextEncoder().encode(str).buffer;
  const digested = await subtle.digest(SHA_256, arrayBuffer);
  return arrayBufferToHex(digested);
}

export async function sha256WithBase64(base64: string) {
  const arrayBuffer = base64ToArrayBuffer(base64);
  const digested = await subtle.digest(SHA_256, arrayBuffer);
  return arrayBufferToHex(digested);
}

export async function createEcKeyPair(): Promise<KeyPair> {
  const key = await subtle.generateKey(
    { name: ECDSA, namedCurve: SECP256R1 },
    true,
    [Usage.Sign, Usage.Verify]
  );
  const [publicKey, privateKey] = await Promise.all([
    exportEcdsaPublicKey(key.publicKey),
    exportEcdsaPrivateKey(key.privateKey),
  ]);
  return { publicKey, privateKey };
}

export async function signWithSha256AndEcdsa(
  message: string,
  privateKeyHex: string
) {
  const privateKey = await importEcdsaPrivateKey(privateKeyHex);
  const signature = await subtle.sign(
    { name: ECDSA, hash: SHA_256 },
    privateKey,
    stringToArrayBuffer(message)
  );
  return arrayBufferToHex(signature);
}

export async function verifyWithSha256AndEcdsa(
  message: string,
  signatureHex: string,
  publicKeyHex: string
) {
  const publicKey = await importEcdsaPublicKey(publicKeyHex);
  return subtle.verify(
    { name: ECDSA, hash: SHA_256 },
    publicKey,
    hexToArrayBuffer(signatureHex),
    stringToArrayBuffer(message)
  );
}

async function exportEcdsaPublicKey(key: CryptoKey) {
  const publicKey = await subtle.exportKey(Format.SubjectPublicKeyInfo, key);
  return arrayBufferToHex(publicKey);
}

async function exportEcdsaPrivateKey(key: CryptoKey) {
  const privateKey = await subtle.exportKey(Format.PKCS8, key);
  return arrayBufferToHex(privateKey);
}

async function importEcdsaPublicKey(keyHex: string) {
  return subtle.importKey(
    Format.SubjectPublicKeyInfo,
    hexToArrayBuffer(keyHex),
    { name: ECDSA, hash: SHA_256, namedCurve: SECP256R1 },
    true,
    [Usage.Verify]
  );
}

async function importEcdsaPrivateKey(keyHex: string) {
  return subtle.importKey(
    Format.PKCS8,
    hexToArrayBuffer(keyHex),
    { name: ECDSA, hash: SHA_256, namedCurve: SECP256R1 },
    true,
    [Usage.Sign]
  );
}
