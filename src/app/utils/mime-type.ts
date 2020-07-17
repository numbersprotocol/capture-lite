export interface MimeType {
  readonly type: string;
  readonly extension: string;
}

export const JPEG: MimeType = {
  type: 'image/jpeg',
  extension: 'jpg'
};
