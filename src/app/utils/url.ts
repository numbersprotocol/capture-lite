import { MimeType } from './mime-type';

export function toDataUrl(base64: string, mimeType: MimeType | string) {
  return `data:${mimeType};base64,${base64}`;
}

export function getAssetProfileUrl(id: string, token?: string) {
  if (token) {
    return `https://authmedia.net/asset-profile?cid=${id}&token=${token}`;
  }
  return `https://authmedia.net/asset-profile?cid=${id}`;
}
