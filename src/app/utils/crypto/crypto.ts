import Web3 from 'web3';
import { arrayBufferToHex, base64ToArrayBuffer } from '../encoding/encoding';

const subtle = crypto.subtle;
const web3 = new Web3();

export async function sha256WithString(str: string) {
  const arrayBuffer = new TextEncoder().encode(str).buffer;
  const digested = await subtle.digest('SHA-256', arrayBuffer);
  return arrayBufferToHex(digested);
}

export async function sha256WithBase64(base64: string) {
  const arrayBuffer = base64ToArrayBuffer(base64);
  const digested = await subtle.digest('SHA-256', arrayBuffer);
  return arrayBufferToHex(digested);
}

export function createEthAccount() {
  return web3.eth.accounts.create();
}

export function loadEthAccount(privateKey: string) {
  return web3.eth.accounts.privateKeyToAccount(privateKey);
}

export function verifyWithEthSignature(
  message: string,
  signature: string,
  publicKey: string
) {
  try {
    return web3.eth.accounts.recover(message, signature) === publicKey;
  } catch (e: unknown) {
    return false;
  }
}
