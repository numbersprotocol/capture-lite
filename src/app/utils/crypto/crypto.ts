import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { arrayBufferToHex, base64ToArrayBuffer } from '../encoding/encoding';

const subtle = crypto.subtle;

export function sha256$(base64: string) {
  return of(base64ToArrayBuffer(base64)).pipe(
    switchMap(arrayBuffer => subtle.digest('SHA-256', arrayBuffer)),
    map(digested => arrayBufferToHex(digested))
  );
}
