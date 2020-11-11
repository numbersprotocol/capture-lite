import { concatMap } from 'rxjs/operators';
import {
  arrayBufferToBase64, arrayBufferToHex, arrayBufferToString, base64ToArrayBuffer,
  blobToDataUrlWithBase64$, dataUrlWithBase64ToBlob$, hexToArrayBuffer, stringToArrayBuffer
} from './encoding';

describe('encoding', () => {

  it('test base64ToArrayBufferConversion', () => {
    const expected = 'd3Rm';
    expect(arrayBufferToBase64(base64ToArrayBuffer(expected))).toEqual(expected);
  });

  it('test arrayBufferToHexConversion', () => {
    const expected = Uint8Array.from([1, 2, 3]).buffer;
    expect(hexToArrayBuffer(arrayBufferToHex(expected))).toEqual(expected);
  });

  it('test stringToArrayBufferConversion', () => {
    const expected = 'hello';
    expect(arrayBufferToString(stringToArrayBuffer(expected))).toEqual(expected);
  });

  it('test base64ToBlobConversion', (done: DoneFn) => {
    const expected = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAECAYAAACtBE5DAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAA9aVRYdENyZWF0aW9uIFRpbWUAAAAAADIwMjDlubTlhavmnIgxMeaXpSAo6YCx5LqMKSAxMeaZgjIw5YiGMTbnp5JpXef5AAAAP0lEQVQImWOUk5P7z4AFMGETZGBgYGA+e3xSg7uFFAPD/dsM19/8QUhcvvOz4auWNUNGlATDnTWXGR7/g0gAAFsdErMML91eAAAAAElFTkSuQmCC';
    dataUrlWithBase64ToBlob$(expected).pipe(
      concatMap(blob => blobToDataUrlWithBase64$(blob))
    ).subscribe(base64 => {
      expect(base64).toEqual(expected);
      done();
    });
  });
});
