// MimeType should be the subset of string type so `JSON.stringify` can generate meaningful text to
// other platform.
export type MimeType = 'image/jpeg' | 'image/png' | 'application/octet-stream';

export function getExtension(mimeType: MimeType) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
  }
}

export function fromExtension(extension: string): MimeType {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      throw TypeError(`Unknown extension: ${extension}`);
  }
}
