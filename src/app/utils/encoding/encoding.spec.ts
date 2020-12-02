import { MimeType } from '../mime-type';
import {
  arrayBufferToBase64,
  arrayBufferToHex,
  arrayBufferToString,
  base64ToArrayBuffer,
  base64ToBlob,
  base64ToString,
  blobToBase64,
  hexToArrayBuffer,
  stringToArrayBuffer,
  stringToBase64,
} from './encoding';

describe('encoding', () => {
  it('should convert between base64 and ArrayBuffer', () => {
    const expected = 'd3Rm';
    expect(arrayBufferToBase64(base64ToArrayBuffer(expected))).toEqual(
      expected
    );
  });

  it('should convert between ArrayBuffer and hex', () => {
    const expected = Uint8Array.from([1, 2, 3]).buffer;
    expect(hexToArrayBuffer(arrayBufferToHex(expected))).toEqual(expected);
  });

  it('should convert between string and ArrayBuffer', () => {
    const expected = 'hello';
    expect(arrayBufferToString(stringToArrayBuffer(expected))).toEqual(
      expected
    );
  });

  it('should convert between base64 and blob', async () => {
    const base64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAYAAAAECAYAAACtBE5DAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAA9aVRYdENyZWF0aW9uIFRpbWUAAAAAADIwMjDlubTlhavmnIgxMeaXpSAo6YCx5LqMKSAxMeaZgjIw5YiGMTbnp5JpXef5AAAAP0lEQVQImWOUk5P7z4AFMGETZGBgYGA+e3xSg7uFFAPD/dsM19/8QUhcvvOz4auWNUNGlATDnTWXGR7/g0gAAFsdErMML91eAAAAAElFTkSuQmCC';
    const mimeType: MimeType = 'image/png';

    const blob = await base64ToBlob(base64, mimeType);
    expect(await blobToBase64(blob)).toEqual(base64);
  });

  it('should convert between string and base64', () => {
    const str = 'hello';

    const base64 = stringToBase64(str);
    expect(base64ToString(base64)).toEqual(str);
  });
});
