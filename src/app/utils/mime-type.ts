// MimeType should be the subset of string type so `JSON.stringify` can generate meaningful text to
// other platform.
export type MimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'application/octet-stream';

export function toExtension(mimeType: MimeType) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'application/octet-stream':
      return 'bin';
    default:
      throw TypeError(`Unknown MIME type: ${mimeType}`);
  }
}

export function fromExtension(extension: string): MimeType {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'bin':
      return 'application/octet-stream';
    default:
      throw TypeError(`Unknown extension: ${extension}`);
  }
}
