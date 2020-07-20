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
  return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))).buffer;
}
