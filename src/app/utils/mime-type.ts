// MimeType should be the subset of string type so `JSON.stringify` can generate meaningful text to
// other platform.
export type MimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/svg+xml'
  | 'image/gif'
  | 'video/mp4'
  | 'video/quicktime'
  | 'application/octet-stream';

export function toExtension(mimeType: MimeType) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/svg+xml':
      return 'svg';
    case 'image/gif':
      return 'gif';
    case 'video/mp4':
      return 'mp4';
    case 'video/quicktime':
      return 'mov';
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
    case 'svg':
      return 'image/svg+xml';
    case 'gif':
      return 'image/gif';
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'bin':
      return 'application/octet-stream';
    default:
      throw TypeError(`Unknown extension: ${extension}`);
  }
}
