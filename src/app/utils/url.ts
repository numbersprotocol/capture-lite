import { BUBBLE_IFRAME_URL } from '../shared/dia-backend/secret';
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

export function getAssetProfileForNSE(id: string, token?: string) {
  if (token) {
    return `https://nftsearch.site/asset-profile?cid=${id}&tmp_token=${token}`;
  }
  return `https://nftsearch.site/asset-profile?cid=${id}`;
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

/**
 * Reverts the file path obtained from Capacitor.convertFileSrc back to its original form.
 *
 * @param filePath - The file path to revert.
 * @returns The reverted file path.
 */
export function revertCapacitorFilePath(filePath: string): string {
  const capacitorFilePrefix = /https?:\/\/[^/]+\/_capacitor_file_\//;
  const originalFilePrefix = 'file:///'; // Replace with your chosen variable name
  return filePath.replace(capacitorFilePrefix, originalFilePrefix);
}
