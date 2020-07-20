export interface MimeType {
  readonly type: string;
  readonly extension: string;
}

export function fromExtension(extension: string) {
  switch (extension) {
    case 'jpeg':
    case 'jpg':
      return JPEG;

    case 'png':
      return PNG;

    default:
      throw new Error('Unknown extension.');
  }
}

export const JPEG: MimeType = {
  type: 'image/jpeg',
  extension: 'jpg'
};

export const PNG: MimeType = {
  type: 'image/png',
  extension: 'png'
};
