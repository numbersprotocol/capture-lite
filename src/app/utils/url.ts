import { DiaBackendAsset } from '../shared/dia-backend/asset/dia-backend-asset-repository.service';
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

export function getCapturePage(asset: DiaBackendAsset) {
  const nid =
    asset.type === 'child' && asset.parent_asset_cid
      ? asset.parent_asset_cid
      : asset.id;
  let url = `https://asset.captureapp.xyz/${nid}`;
  if (
    asset.type === 'child' &&
    asset.nft_chain_id &&
    asset.nft_contract_address &&
    asset.nft_token_id
  ) {
    url +=
      `?chain_id=${asset.nft_chain_id}` +
      `&contract=${asset.nft_contract_address}` +
      `&token_id=${asset.nft_token_id}`;
  }
  return url;
}

export function getFaqUrl() {
  return 'https://docs.captureapp.xyz/faq';
}

export function getShowcaseUrl(username: string) {
  return `https://dashboard.captureapp.xyz/showcase/${username}`;
}
