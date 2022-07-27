import { urlToDownloadApp } from './constants';
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

export function getAppDownloadLink(isPlatform: (platformName: any) => boolean) {
  if (isPlatform('ios'))
    return 'https://apps.apple.com/en/app/capture-app/id1536388009';

  if (isPlatform('android'))
    return 'https://play.google.com/store/apps/details?id=io.numbersprotocol.capturelite';

  return urlToDownloadApp;
}
