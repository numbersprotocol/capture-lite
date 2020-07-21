import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { arrayBufferToHex, base64ToArrayBuffer } from '../encoding/encoding';

const subtle = crypto.subtle;
const SHA_256 = 'SHA-256';

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
