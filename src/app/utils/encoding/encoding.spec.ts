import { arrayBufferToBase64, arrayBufferToHex, base64ToArrayBuffer, hexToArrayBuffer } from './encoding';

describe('encoding', () => {
  it('test base64ToArrayBufferConversion', () => {
    const expected = 'd3Rm';
    expect(arrayBufferToBase64(base64ToArrayBuffer(expected))).toEqual(expected);
  });

  it('test arrayBufferToHexConversion', () => {
    const expected = Uint8Array.from([1, 2, 3]).buffer;
    expect(hexToArrayBuffer(arrayBufferToHex(expected))).toEqual(expected);
  });
});
