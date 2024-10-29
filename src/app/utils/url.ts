import { BUBBLE_IFRAME_URL } from '../shared/dia-backend/secret';
import { urlToDownloadApp } from './constants';
import { MimeType } from './mime-type';

export function toDataUrl(base64: string, mimeType: MimeType | string) {
  return `data:${mimeType};base64,${base64}`;
}

export function getAssetProfileForNSE(id: string) {
  return `https://verify.numbersprotocol.io/asset-profile/${id}`;
}

export function getAssetProfileForCaptureIframe(cid: string) {
  return `${BUBBLE_IFRAME_URL}/asset_page?nid=${cid}`;
}

export function getAppDownloadLink(isPlatform: (platformName: any) => boolean) {
  if (isPlatform('ios'))
    return 'https://apps.apple.com/en/app/capture-app/id1536388009';

  if (isPlatform('android'))
    return 'https://play.google.com/store/apps/details?id=io.numbersprotocol.capturelite';

  return urlToDownloadApp;
}

export function getFaqUrl() {
  return 'https://docs.captureapp.xyz/faq';
}

export function getShowcaseUrl(username: string) {
  return `https://dashboard.captureapp.xyz/showcase/${username}`;
}
