export enum BubbleToIonicPostMessage {
  IFRAME_ON_LOAD = 'iframe-on-load',
  IFRAME_BACK_BUTTON_CLICKED = 'iframe-back-button-clicked',
  EDIT_CAPTION_CANCEL = 'edit-caption-cancel',
  EDIT_CAPTION_SAVE = 'edit-caption-save',
  IFRAME_BUY_NUM_BUTTON_CLICKED = 'iframe-buy-num-button-clicked',
  IFRAME_COPY_TO_CLIPBOARD_ASSET_WALLET = 'iframe-copy-to-clipboard-asset-wallet',
  IFRAME_COPY_TO_CLIPBOARD_INTEGRITY_WALLET = 'iframe-copy-to-clipboard-integrity-wallet',
  IFRAME_COPY_TO_CLIPBOARD_PRIVATE_KEY = 'iframe-copy-to-clipboard-private-key',
}

export enum IonicToBubblePostMessage {
  ANDROID_BACK_BUTTON = 'android-back-button',
}
