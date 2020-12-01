import { MimeType } from '../mime-type';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
}

export function arrayBufferToHex(arrayBuffer: ArrayBuffer) {
  return [...new Uint8Array(arrayBuffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToArrayBuffer(hex: string) {
  // tslint:disable-next-line: no-non-null-assertion
  return new Uint8Array(hex.match(/[\da-f]{2}/gi)!.map(h => parseInt(h, 16)))
    .buffer;
}

export function stringToArrayBuffer(str: string) {
  return textEncoder.encode(str).buffer;
}

export function arrayBufferToString(arrayBuffer: ArrayBuffer) {
  return textDecoder.decode(arrayBuffer);
}

export async function base64ToBlob(base64: string, mimeType: MimeType) {
  const dataUrl = `data:${mimeType};base64,${base64}`;
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function blobToBase64(blob: Blob) {
  return new Promise<string>(resolve => {
    const fileReader = new FileReader();
    fileReader.onloadend = () =>
      resolve((fileReader.result as string).split(',')[1]);
    fileReader.readAsDataURL(blob);
  });
}
