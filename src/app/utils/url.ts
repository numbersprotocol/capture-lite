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

export function getAssetProfileUrlWithTmpToken(id: string, tmpToken?: string) {
  if (tmpToken) {
    return `https://authmedia.net/asset-profile?cid=${id}&tmp_token=${tmpToken}`;
  }
  return `https://authmedia.net/asset-profile?cid=${id}`;
}
