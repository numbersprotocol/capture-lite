/**
 * Enum representing custom event names for AppsFlyer in-app events.
 *
 * While it's recommended to use predefined event names, custom event names are easier for QA
 * and marketing teams to understand and filter out in the AppsFlyer dashboard. Refer to the Asana
 * comment https://app.asana.com/0/0/1206618451736620/1206636906894474/f for more details.
 *
 * Every custom event name should be prefixed with 'ccam_' which stands for Capture Cam. This prefix
 * helps to distinguish between predefined AppsFlyer event names such as 'af_level_achieved', etc.
 */
export enum CCamCustomEventType {
  CCAM_TRY_CLICK_CAMERA_SHUTTER = 'ccam_try_click_camera_shutter',
}
