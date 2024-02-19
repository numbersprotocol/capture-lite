/**
 * Enum representing predefined event types for AppsFlyer in-app events.
 *
 * Note: appsflyer-capacitor-plugin does not provide these constants.
 * Therefore, they are defined manually here.
 *
 * For a list of predefined event names, see:
 * {@link https://dev.appsflyer.com/hc/docs/in-app-events-android#event-constants|AppsFlyer Predefined Event Constants}.
 */
export enum AFInAppEventType {
  LEVEL_ACHIEVED = 'af_level_achieved',
}

/**
 * Enum representing predefined event parameter names for AppsFlyer in-app events.
 *
 * Note: appsflyer-capacitor-plugin does not provide these constants.
 * Therefore, they are defined manually here.
 *
 * For a list of predefined event parameters, see:
 * {@link https://dev.appsflyer.com/hc/docs/in-app-events-android#predefined-event-parameters|AppsFlyer Predefined Event Parameters}.
 */
export enum AFInAppEventParameterName {
  /**
   * The level parameter for in-app events.
   *
   * Levels can be determined by the type of event. For example:
   * - Level 1: User clicks on the camera shutter or navigates to explore page.
   * - Level 2: Actions that require more effort such as registering an asset.
   * - Level 3: User executes network actions such as Mint & Share.
   *
   * Consult and communicate with the product manager to determine appropriate levels.
   */
  LEVEL = 'af_level',
  /**
   * The score parameter for in-app events.
   *
   * Typically, this parameter is set to 0 as no decision is currently made based on 'af_score'.
   * However, it can be used to assign scores to users based on their actions in the app.
   *
   * Consult and communicate with the product manager to determine the usage of scores.
   */
  SCORE = 'af_score',
}

export enum CCamCustomEventType {
  CCAM_TRY_CLICK_CAMERA_SHUTTER = 'ccam_try_click_camera_shutter',
}
