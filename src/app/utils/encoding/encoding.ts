import { defer, Subject } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
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
  return new Uint8Array(hex.match(/[\da-f]{2}/gi)!.map(h => parseInt(h, 16))).buffer;
}

export function stringToArrayBuffer(str: string) {
  return textEncoder.encode(str).buffer;
}

export function arrayBufferToString(arrayBuffer: ArrayBuffer) {
  return textDecoder.decode(arrayBuffer);
}

export function dataUrlWithBase64ToBlob$(base64: string) {
  return defer(() => fetch(base64)).pipe(
    first(),
    switchMap(res => res.blob())
  );
}

export function blobToDataUrlWithBase64$(blob: Blob) {
  const fileReader = new FileReader();
  const subject$ = new Subject<string>();
  fileReader.onloadend = () => {
    subject$.next(fileReader.result as string);
    subject$.complete();
  };
  fileReader.readAsDataURL(blob);
  return subject$.asObservable();
}
