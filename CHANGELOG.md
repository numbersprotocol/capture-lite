# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

1. Add missing NSLocationAlwaysAndWhenInUseUsageDescription purpose string in Info.plist for iOS

## [0.101.1] - 2025-03-21

### Fixed

1. Fix issue where login gets stuck on "Please wait…" after logout on Android or after rejecting a notification [#3332](https://github.com/numbersprotocol/capture-lite/pull/3332)

## [0.101.0] - 2025-03-19

### Added

1. Support Google account for login and sign-up [#3328](https://github.com/numbersprotocol/capture-lite/pull/3328)

### Changed

1. Upgrade Capacitor to v7 [#3328](https://github.com/numbersprotocol/capture-lite/pull/3328)

### Fixed

1. Fix the persistent popup tutorial [#3328](https://github.com/numbersprotocol/capture-lite/pull/3328)
2. Fix the typo on the signup page [#3327](https://github.com/numbersprotocol/capture-lite/pull/3327)
3. Fix the persistent migration popup dialog caused by incorrect string version comparison [#3325](https://github.com/numbersprotocol/capture-lite/pull/3325)

## [0.100.0] - 2025-02-13

### Changed

1. Update the share text to "Social Share" and set the share link to the Capture page [#3324](https://github.com/numbersprotocol/capture-lite/pull/3324)

## [0.99.0] - 2024-11-15

### Changed

1. Bumps follow-redirects from 1.14.1 to 1.15.9 [#3295](https://github.com/numbersprotocol/capture-lite/pull/3295)
1. Bumps braces from 3.0.2 to 3.0.3 [#3288](https://github.com/numbersprotocol/capture-lite/pull/3288)
1. Bumps ejs from 3.1.8 to 3.1.10 [#3293](https://github.com/numbersprotocol/capture-lite/pull/3293)
1. Bumps socket.io from 4.5.4 to 4.8.1 [#3292](https://github.com/numbersprotocol/capture-lite/pull/3292)
1. Bumps json5 from 1.0.1 to 1.0.2 [#2453](https://github.com/numbersprotocol/capture-lite/pull/2453)
1. Bumps decode-uri-component from 0.2.0 to 0.2.2 [#2374](https://github.com/numbersprotocol/capture-lite/pull/2374)
1. Bumps loader-utils from 2.0.0 to 2.0.4 [#2318](https://github.com/numbersprotocol/capture-lite/pull/2318)
1. Bumps body-parser and express. These dependencies needed to be updated together [#3261](https://github.com/numbersprotocol/capture-lite/pull/3261)
1. Bumps secp256k1 from 4.0.2 to 4.0.4 [#3262](https://github.com/numbersprotocol/capture-lite/pull/3262)
1. Bumps http-cache-semantics from 4.1.0 to 4.1.1 [#2558](https://github.com/numbersprotocol/capture-lite/pull/2558)
1. Bumps cookiejar from 2.1.2 to 2.1.4 [#2513](https://github.com/numbersprotocol/capture-lite/pull/2513)
1. Bumps karma from 6.3.4 to 6.3.16 [#1346](https://github.com/numbersprotocol/capture-lite/pull/1346)

### Fixed

1. Fix the default value for network action by removing the extra space, and ensure the default_values_list_text field is handled if it's missing in the response [#3291](https://github.com/numbersprotocol/capture-lite/pull/3291)
1. Fix the issue where the button color doesn't change on the network action detail page when it is disabled [#3291](https://github.com/numbersprotocol/capture-lite/pull/3291)
1. Fix npm WARN EBADENGINE and npm WARN deprecated warnings [#3287](https://github.com/numbersprotocol/capture-lite/pull/3287)

### Removed

1. Remove the unused ActionsDialogComponent [#3291](https://github.com/numbersprotocol/capture-lite/pull/3291)

### Chore

1. Fix issue preventing Dependabot checks from completing [#3280](https://github.com/numbersprotocol/capture-lite/pull/3280)

## [0.98.0] - 2024-10-29

### Added

1. Add a shared link to the Showcase page on the Home page [#3256](https://github.com/numbersprotocol/capture-lite/pull/3256)

### Changed

1. Upgrade library cordova-plugin-purchase to version 13.11.1 to support Google Play Billing library 7.0.0 [c07f1d0](https://github.com/numbersprotocol/capture-lite/commit/09df7c07cc410488e23a179ea58c2ab2ee0b474b)
1. Display and update profile name instead of username [#3255](https://github.com/numbersprotocol/capture-lite/pull/3255)
1. Reduce duplicate API calls for profile [#3255](https://github.com/numbersprotocol/capture-lite/pull/3255)

### Fixed

1. Fix wallet credits not refreshing after a purchase [c07f1d0](https://github.com/numbersprotocol/capture-lite/commit/09df7c07cc410488e23a179ea58c2ab2ee0b474b)
1. Fix toast error display when canceling a purchase [c07f1d0](https://github.com/numbersprotocol/capture-lite/commit/09df7c07cc410488e23a179ea58c2ab2ee0b474b)

### Removed

1. Remove unused pages: `ProfilePage` and `PhoneVerificationPage`, and the service `DiaBackendAssetRefreshingService` [#3255](https://github.com/numbersprotocol/capture-lite/pull/3255)

## [0.97.1] - 2024-09-20

### Fixed

1. Fix the GitHub workflow issue where deprecated versions of actions/upload-artifact and actions/download-artifact are causing a deployment error. [#3254](https://github.com/numbersprotocol/capture-lite/pull/3254)

## [0.97.0] - 2024-09-20

### Changed

1. Link the asset profile to the parent asset instead of the child asset [#3253](https://github.com/numbersprotocol/capture-lite/pull/3253)

## [0.96.0] - 2024-07-25

### Changed

1. Switch the Firebase release to use the iframe test version [#3252](https://github.com/numbersprotocol/capture-lite/pull/3252)
1. Replace the iframe FAQ with the GitBook FAQ [#3251](https://github.com/numbersprotocol/capture-lite/pull/3251)
1. Update target API level for Android [#3249](https://github.com/numbersprotocol/capture-lite/pull/3249)
   - Update the app to target Android 14 (API level 34) to meet Google Play's target API level requirements
   - Upgrade Capacitor to v6 to set Android Target SDK 34
   - Update the code to resolve type hint errors

### Fixed

1. Fix the issue where the referral code is not included in the text when sharing in the zh setting [#3250](https://github.com/numbersprotocol/capture-lite/pull/3250)

## [0.95.1] - 2024-05-30

### Changed

1. Adjust the C2PA loading text and pass the current URL for returning back [#3248](https://github.com/numbersprotocol/capture-lite/pull/3248)

## [0.95.0] - 2024-05-29

### Changed

1. Improve the C2PA download flow by using a browser-based method instead of the sharing method [#3247](https://github.com/numbersprotocol/capture-lite/pull/3247)

## [0.94.0] - 2024-05-14

### Added

1. Update the share menu in the asset detail page as follows: [#3244](https://github.com/numbersprotocol/capture-lite/pull/3244)
   - Add "Download C2PA" (new option)
   - Add "View Blockchain Proof" (old: View asset profile)
   - Update "Share Blockchain Proof" (current: Share Asset Profile)
   - Update "Copy Nid" (current: Copy IPFS address)

### Fixed

1. Fix prefetch error caused by incorrect asset information format [#3245](https://github.com/numbersprotocol/capture-lite/pull/3245)

## [0.93.0] - 2024-04-25

### Changed

1. Change explorer tab to collection tab, replacing iframe URL and icon [#3243](https://github.com/numbersprotocol/capture-lite/pull/3243)
1. Update the URL format of the asset profile from
   `/asset-profile?nid=${nid}` to `/asset-profile/${nid}` [#3242](https://github.com/numbersprotocol/capture-lite/pull/3242)
1. Remove the unused `tmp_token` from the asset profile URL [#3242](https://github.com/numbersprotocol/capture-lite/pull/3242)

## [0.92.0] - 2024-04-18

### Changed

1. Remove `View asset profile` and move `Share Asset Profile` to the first option in the detail share menu [#3241](https://github.com/numbersprotocol/capture-lite/pull/3241)
1. Remove authmedia.net from the sharing process [#3240](https://github.com/numbersprotocol/capture-lite/pull/3240)

## [0.91.0] - 2024-04-03

### Added

1. Create a CI/CD workflow for Firebase distribution. [#3238](https://github.com/numbersprotocol/capture-lite/pull/3238)

### Changed

1. Upgrade macOS from version 12 to version 14 to resolve the SDK version issue. [#3239](https://github.com/numbersprotocol/capture-lite/pull/3239)
1. Sort network actions by `index` field to allow control of display order [#3237](https://github.com/numbersprotocol/capture-lite/pull/3237)

## [0.90.0] - 2024-03-08

### Added

1. Feature sort assets in VERIFIED tab by uploaded at [#3233](https://github.com/numbersprotocol/capture-lite/pull/3233)
1. Feature pass x api key to get app info [#3231](https://github.com/numbersprotocol/capture-lite/pull/3231)

## [0.89.2] - 2024-02-21

### Fixed

1. Fix appsflyer iOS integration test IDFA not collected [#3223](https://github.com/numbersprotocol/capture-lite/pull/3223)

## [0.89.2] - 2024-02-21

### Added

1. Feature track new app users shutter click (#3215)
1. Feature Disable upload feature on Capture Cam (#3216)

### Fixed

1. Hotfix test ci prevent actions run twice (#2989)

## [0.88.8] - 2024-01-31

### Changed

1. Revert Feat confirm dialog on pull to refresh (#3171)
1. Revert Fix excessive api call (#3157)
1. Revert Feat sort assets in VERIFIED tab by uploaded_at (#3158)

## [0.88.6] - 2024-01-11

### Added

1. Feature update the NSE domain (#3161)
1. Feat confirm dialog on pull to refresh (#3171)
1. Feat sort assets in VERIFIED tab by uploaded_at (#3158)

### Fixed

1. Fix excessive api call (#3157)

## [0.87.1] - 2023-12-04

### Fixed

1. Fix in app purchase by migrating cordove-plugin-purchase to v13 (#3125)

## [0.87.0] - 2023-11-30

### Added

1. Feature add integrity sha on asset creation (#3094)
1. Feature Add the API key to the header in the API that creates an asset to record the service_name of assets (#3117)

## [0.86.4] - 2023-11-11

### Added

1. Feature newtork app ui update (#3073)
1. Feature Update instructions about the upload size limitation (#3074)
1. Feature fit figma profile page tab (#3075)

### Fixed

1. Fix Issue When user registers the account but user inputs the existing name the error message is wrong (#3076)

## [0.85.2] - 2023-09-21

### Added

1.  Feature sprint 1 edit profile (#3028)

### Fixed

1.  Fix v230905 issue order details iframe url is broken (#3027)

## [0.84.0] - 2023-08-29

### Added

1.  Feature v230822 use appsflyer official plugin (#3012)
1.  Feature v230822 Remove options from list on ionic asset page (#3013)

### Fixed

1.  Fix v230814 issue Some asset can't show "share asset profile" on asset page (#3014)

## [0.83.2] - 2023-08-15

### Added

1. Feature v230808 configure capture app to receive deep links (#2974)
1. Feature v230725 showing order information in the transaction (#2971)
1. Feature set ios minimum version to 15.7 (#2967)
1. Feature v230725 showing order information in the transaction (#2965)

### Fixed

1. Fix v230808 Update Invite Friends Message Text (#2980)
1. Fix v230808 After edit caption need to press back button (#2973)
1. Fix v230725 Update Icon to Reflect Completed Email Verification Process (#2963)
1. Fix v230725 appsflyer after capacitor 5 migration (#2962)

## [0.82.4] - 2023-08-01

### Fixed

1. Fix User can’t register asset when using capture camera (#2930)
1. Fix can't register new account on some android device (#2953)

## [0.82.3] - 2023-07-28

### Fixed

1. Fix sign up page links for term of use and data policy.

## [0.82.2] - 2023-07-27

### Added

1. Add new tab "DRAFT" on mycapture tab (#2931)

### Fixed

1. Fix Change capture tab VALIDATED to VERIFIED (#2939)
1. Fix 4k videos can not generate thumbnail on some android devices (Android only) (#2923). reverted (#2938)
1. Fix show correct error mesage for sign up duplicate username error (#2926)

### Changed

1. Refactor details.page.ts according to ChatGPT suggestions (#2927)
1. Migrate from Capacitor 4 to Capacitor 5 (#2918)

## [0.81.2] - 2023-06-04

### Added

1. Feat Sprint 2 Upload video SHORT (#2868)

### Fixed

1. Fix issue On android device user can't upload image (#2869)
1. Fix build apks CI CD (#2879)
1. Fix code quality discussion_r1144354340 (#2865)
1. Fix code quality discussion_r1144347240 (#2866)
1. Fix code quality discussion_r1144347240 (#2866)

## [0.79.0] - 2023-05-25

### Added

1. Feat add status bar in ionic page between image and caption (#2810)

### Fixed

1. Refactor pre publish component (#2809)
1. Fix issue flip camera for oppo and other devices if any (#2811)
1. Fix issue error message when without device permission (#2812)

## [0.78.0] - 2023-04-24

### Added

1. Feat capture app flavours should be built automatically by CI/CD (#2731)
1. Feat set device information when user signing up (#2732)
1. Feat should be able to view photos even if the registration fails (#2733)
1. Feat asset saved to device camera roll (#2734)
1. Feat when user first open capture app pop up to encourage users to take a photo (#2735)

## [0.77.2] - 2023-04-18

### Fixed

1. Fix issue When asset registration is incomplete the asset page will repeatedly reload (#2725)
1. Fix error message for iOS duplicate photo uploads (#2724)

To check the difference between the last releaes and the latest dev status, click the link above.

## [0.77.1] - 2023-04-07

### Fixed

1. Fix GitHub CI, add missing PIPEDREAM_DELETE_CAPTURE_ACCOUNT to pre-release.yml & build-apks.yml (#2700)

## [0.77.0] - 2023-04-03

### Added

1. Feature upload image (#2671)
1. Feature show clear error handling of change username on my capture page (#2664)
1. Feature special provider for photos taken from capture app (#2667)

### Fixed

1. Fix for ios action of capture ci fail to upload ipa to test flight (#2668)
1. Fix show message if asset registration insufficient num (#2669)
1. Fix ionic navigation with iframe back button (#2670)
1. Fix issue capture details swipe left right is not showing expected capture (#2665)
1. Fix delete account should work real (#2666)

## [0.75.2] - 2023-03-13

### Fixed

1. Hotfixed allow user to publish videos.

## [0.75.1] - 2023-03-02

### Fixed

1. Hotfix set FAQ iframe url to live version

## [0.75.0] - 2023-03-02

### Added

1. Feature swap explore tab with profile tab (#2590)
2. Feature add faq page (#2588)
3. Feature crop ux flow improvement (#2587)
4. Feature increase android minimum required os (#2586)

### Fixed

1. Fixed unify iframe post messages in wallets page (#2613)
2. Fixed unify iframe post messages (#2589)
3. Fixed android 11 splash screen (#2585)

## [0.74.2] - 2023-02-14

### Fixed

1. Disable deprecated uploadBitcode in ios CI

## [0.74.1] - 2023-02-16

### Changed

1. Changed text "Get 5 credits ..." to "Get 3 credits ..."

## [0.74.0] - 2023-02-14

### Added

1. Feature support iframe wallet page (#2577)

### Fixed

1. Fix camera tap to focus (#2527)
2. Fix to show bronze pack price (#2521)

## [0.73.1] - 2023-01-30

### Added

1. Feature to prevent collected captures to edit or unpublish (#2502)
2. Rebranded settings page (#2499)
3. Rebranded app menu (#2498)

### Changed

1. Changd translations "gas fee" to "estimated gas fee" (#2500)

## [0.72.4] - 2023-01-10

### Fixed

1. Force set QR code text to white in Transfer page (#2466)

## [0.72.3] - 2023-01-06

### Fixed

1. Revert workaround for forcing webview dark mode on Android (#2457)
2. Revert qr code text color to white in Transfer page (#2460)

## [0.72.2] - 2023-01-04

### Fixed

1. Change qr code text color to white in deposite page (#2448)
2. Fix wallet page mainnet text vertical allignment to center (#2449)

## [0.72.1] - 2022-12-23

### Fixed

1. Fix wallet page wording (#2438)

## [0.72.0] - 2022-12-23

### Added

1. Support native NUM in wallet (#2425)
2. User can update username (#2426)

### Changed

1. Update splash screen design for Android 12 breaking change (#2424)

### Fixed

1. Avoid white flash on some OEM Android by setting Capacitor webview to dard (#2436)
2. Force focus to 1st field in dialog on iOS (#2419)
3. Remove iframe URL from clear traffic config (#2412)
4. Fix translation (#2411)
5. Fix linting (#2437)

## [0.71.2] - 2022-12-23

### Fixed

1. Fix custom camera header, footer sizes (#2415)

## [0.71.1] - 2022-12-21

### Changed

1. Rename Story to Short (#2406)

## [0.71.0] - 2022-12-20

### Added

1. Add auto rotate in camera to make asset generation UX like using native camera (#2401)
1. Add tab mode in camera to show current mode is to take photo or video (story) (#2398)

### Fixed

1. Fix white flash happened when switching views on iOS (#2371)
1. Fix text in the camera's next button (#2370)
1. Fix missing necessary build file (#2372)
1. Fix CI linting error (#2392)

## [0.70.0] - 2022-11-29

### Added

1. Cropping camera images (#2344)

### Changed

1. Upgrade Capacitor from 3 to 4 (#2329)

### Fixed

1. User cannot confirm camera image on Pixel 6a (#2346)
2. User cannot close camera on Pixel 6a (#2332)

## [0.69.3] - 2022-11-28

### Fixed

1. Fix "File does not exist" error when deleting an asset (#2339)
2. Fix NUM price status after a product is unlisted (#2336)
3. Improve camera zoom in/out sensitivity (#2330)
4. Fix Android Store uploading error by updating Android API to version 32 (#2325)

## [0.69.2] - 2022-11-17

### Changed

1. User can update asset info by clicking the `Edit` option (#2310)

### Fixed

1. Fix Android go back button navigation (#2298)
2. Disable the `Mint & Share` option temporarily (#2311)

## [0.69.1] - 2022-11-08

### Fixed

1. Reload only iframe without feature creators' section (#2290)
1. Update camera's HD icon from LOW/HD to HD with/without background (#2264)
1. Fix the wording of asset listing target from CaptureClub to Capture App (#2276)
1. Improve the wording of canNotPerformMintAndShareAction (#2277)

## [0.69.0] - 2022-11-01

### Changed

1. User can unpublish asset from CaptureClub (#2258)
2. Rebrand NUM Points to Capture Credits (#2259)
3. Move delete account button from profile page to settings page (#2260)

### Fixed

1. Make photo editor to respect UI design of black-white filter and HD button (#2257)
1. Result RUL in the network app history should be URL of Capture asset page (#2255)
1. Increase thumbnail resolution to 500x500 in profile tab (#2256)
1. Fix CI build (#2251, #2252)

## [0.68.0] - 2022-10-25

### Changed

1. Support photo editor (#2208)

### Fixed

1. Remove duplicate network status (#2203)
1. Fix camera crash on iOS when recording video (#2209)
1. Rename Itegrity Key to Integrity Wallet (#2210)

## [0.67.1] - 2022-10-21

### Fixed

1. Request num points on wallets page only (#2182)
1. Implement pseudo lazy loading in the capture tab (#2200)

## [0.67.0] - 2022-10-04

### Changed

1. Camera supports 2 resolutions: max and social (#2154)
1. Remove CC from menu (#2147)
1. Update NUM price list endpoint (#2109)

### Fixed

1. Use lighter Capture icon to improve loading speed (#2123, #2110)
1. Update onboarding texts to the final version (#2078)
1. Cache and reuse JWT token until near expiration (#2121)
1. Fix typos (#2122)
1. Fix Android notification icon (#2107)

## [0.66.3] - 2022-09-21

### Changed

1. CI update: update iphone compatibility from 12.0 to 14.7

## [0.66.2] - 2022-09-20

### Fixed

1. User can click Capture after uploading is completed (#2082)
2. Press Android back button after taking photo and before pressing confirm, go back to camera (#2092)

## [0.66.1] - 2022-09-15

### Changed

1. CI update: support both qa-release and live versions

## [0.66.0] - 2022-09-15

### Added

1. Support zoom in/out in camera (#2059)
2. Add rebrand onboarding (#2072)

### Changed

1. Change wording from certificate to profile (#2060)

## [0.65.0] - 2022-09-06

[Milestone Sprint 22.08.29](https://github.com/numbersprotocol/capture-lite/milestone/54)

### Added

1. Replace Authmedia by NSE (#2000)
2. Support tapping to focus in camera (#2001)

### Changed

1. Make iframe URL configurable (#1979)
2. Update asset_page URL params (#1989)
3. Update grid layout in profile tab (#2022)
4. Preserve tab state (#2027, #2034)
5. Use new JWT in iframe (#2037)

### Fixed

1. Centerize user email on profile (#1969)

## [0.64.4] - 2022-08-29

### Fixed

1. Added the missed iframe URL secret to the CI scripts.

## [0.64.3] - 2022-08-29

### Changed

1. Update asset_page URL params (#1989)
2. Make iframe URL configurable (#1979)

### Fixed

1. Put user email at center in the capture tab (#1969)

## [0.64.2] - 2022-08-25

### Fixed

1. Add missing AppsFlyer secret for CI

## [0.64.1] - 2022-08-25

### Fixed

1. Use qa-release iframe in the details page (#1967)
2. Add AppsFlyer key in CI scripts (#1966, #1968)

## [0.64.0] - 2022-08-23

[Milestone Sprint 22.08.15](https://github.com/numbersprotocol/capture-lite/milestone/53)

### Added

1. Hide go-back button on the asset pages of the explorer tab (#1957)

### Changed

1. Use qa-release iframe until next stable release (#1958)

## [0.63.2] - 2022-08-16

### Fixed

1. Update logo on the sign in/up page (#1944)
1. Set initial tab from the profile tab to the explorer tab (#1945)
1. Notify user if there is new version available. Disabled unexpectedly and fixed the regression (#1946)

## [0.63.1] - 2022-08-09

### Fixed

1. Use custom camera on native platforms (#1914)
1. Adjust iframe height from 100vh to (100vh - bottom safe area - 48px) for showing entire popup list (#1915)
1. Hide donation button on the asset/prod page (#1916)
1. Include iframe URL to the trusted domains on Android (#1918)
1. Fix iOS status bar appearance (#1919)
1. Update splash screen to rebrand version (#1920, #1925)
1. Set iframe height from 100% to (100vh - top safe area - bottom safe area - 66px) for smooth scrolling (#1921)
1. Remove testing verison URLs (#1924)

## [0.63.0] - 2022-08-03

### Added

1. Rebrand update phase 2, (#1889, #1892, #1893, #1894)

## [0.62.0] - 2022-08-02

### Added

1. Update rebrand home page. (#1853, #1856)

### Fixed

1. Update the App download URL to https://link.numbersprotocol.io/CaptureApp.

### Security

1. Update dependency security patches: ejs, eventsource, minimist, plist, url-parse

## [0.60.4] - 2022-07-31

### Added

1. The "Delete Account" button in the Profile page.

## [0.60.3] - 2022-07-27

### Fixed

- Undo app store, play store receipt truncate

## [0.61.2] - 2022-07-20

### Fixed

- Hide camera flash button for front camera
- Android flash light on only on capture photo or record video

## [0.61.1] - 2022-07-19

### Added

- Camera flash light

### Fixed

- Capture flow, confirm button work smoothly
- Use high resolution as default camera settings

## [0.60.2] - 2022-07-07

### Changed

- Hide deposit button on wallets page for iOS

### Fixed

- Fix withdraw page the text color

## 0.61.0 - 2022-07-14

### Added

- Show discard/confirm capture before upload
- Send generate SEO img & description on share asset

### Fixed

- Remove capture after discard/confirm

## [0.60.1] - 2022-07-06

### Fixed

- Move wallet address QR code to deposit page

## 0.60.0 - 2022-07-05

### Added

- Show QR code for asset wallet address

### Fixed

- Show camera feedback on capture photo
- Show correct error message on duplicate phone verification

## 0.59.5 - 2022-06-28

### Changed

- Temporarely disabled Apps Flyer SDK

## 0.59.4 - 2022-06-28

### Fixed

- Truncate reciept_id from in app purchase

## 0.59.3 - 2022-06-27

### Added

- Add In-App Purchase capability for iOS

## 0.59.2 - 2022-06-22

### Changed

- Revert Show capture options menu regardless of backend response. #1703

## 0.59.1 - 2022-06-22

### Changed

- Change In App Purchase IDs

## 0.59.0 - 2022-06-21

### Added

- In App Purchase NUM points
- In App Upgrade nontification
- Integration with Apps Flyer SDK

### Fixed

- Fix phone verification error messages on phone submit
- Show capture options menu regardless of backend response

## 0.58.2 - 2022-06-07

### Fixed

- Fix revert share asset profile url

## 0.58.1 - 2022-06-02

### Fixed

- Fix build number

## 0.58.0 - 2022-05-31

### Changed

- Update authmedia link to use one-time token for private assets

## 0.57.3 - 2022-05-27

### Fixed

- Fix sign up page errors to be more specific
- Fix user guide for highlighting capture less persistant

### Changed

- Change share referral code text

## 0.57.2 - 2022-05-24

### Fixed

- Show old user guide for iOS
- Show new user guide for Android, Web

## 0.57.1 - 2022-05-19

### Fixed

- Fixed build number for android

## 0.57.0 - 2022-05-18

### Added

- Add a capture app beginner guide

## 0.56.3 - 2022-05-13

### Changed

- Hide Buy NUM button from Wallets page

## 0.56.2 - 2022-05-12

### Fixed

- Fix invitation page app bar text (centered)

## 0.56.1 - 2022-05-12

### Fixed

- Fix custom camera auto rotate (install plugin from separate branch)

## 0.56.0 - 2022-05-10

### Added

- Add invitation page, user can share invitation code

### Fixed

- Fix custom camera auto rotate

### Changed

- Update sign up page, user can optionally enter referral code

## 0.55.1 - 2022-04-27

### Fixed

- Revert commit to show custom camera

## 0.55.0 - 2022-04-22

### Added

- Add custom camera ux

### Changed

- Show buy NUM button at wallets page

## 0.54.2 - 2022-04-21

### Changed

- Hide buy NUM button at wallets page

### Removed

- Temporarely remove custom camera ux

## 0.54.1 - 2022-04-07

### Removed

- Revert Download asset using CDN instead of [DIA backend `/download/` endpoint](https://dia-backend.numbersprotocol.io/api/v3/redoc/#operation/assets_download) #1362

## 0.54.0 - 2022-04-07

### Added

- Add buy NUM button at wallets page
- Support redirecting to external website after successfully submitting a network action order
- Skip storing asset thumbnail for cached assets
- Download asset using CDN instead of [DIA backend `/download/` endpoint](https://dia-backend.numbersprotocol.io/api/v3/redoc/#operation/assets_download) #1362

### Fixed

- Remove the Capture after Gift a Capture or Web 3 archive network action #1129
- Fix wallets and NUM transfer page UI for screen width < 360px
- Fix refresh not working when there's no Capture

## 0.53.0 - 2022-03-31

### Added

- Display insufficient NUM in order confirm dialog if applicable.
- Add loading indicator at Capture transactions history page.
- Warn user that the asset will become public when sharing asset profile.
- Support network action that doesn't take in any parameter.
- Support optional network action parameters.
- Go pro/multi select file upload.

## 0.52.1 - 2022-03-25

### Fixed

- Fix incorrect zh-tw translation for "Share Asset Profile"

## 0.52.0 - 2022-03-25

### Changed

- Replace share option "Share C2PA Photo" with "Share Asset Profile"

### Fixed

- Prevent user from performing List in CaptureClub with the same asset twice.

## 0.51.1 - 2022-03-23

### Fixed

- Prevent race condition when creating network action history record.

## 0.51.0 - 2022-03-22

### Added

- Network action order detail page.
- Display a message on activities page if no transactions or network action orders found.

### Fixed

- Have activities display default to Capture transactions.
- Error message should be displayed at network action orders page. Like when no internet connection.
- Fix ios activity details page cid overflow. #1383
- Rename "More actions" to "Network actions."

## 0.50.1 - 2022-03-16

### Added

- Connect points displayed on the wallets page to real backend.
- Have Capture blockchain certificate links to the new authmedia asset profile page.

### Fixed

- Better error display on wallets and transfer page.
- Check internet connection and prevent users from visiting transfer page if no internet connection.
- Hide buy NUM button.
- Fix network action order history getting generated even when confirm order failed.

## 0.50.0 - 2022-03-14

### Added

- A whole new wallets page
- A new tab in activities page to display network action order history

### Fixed

- Change num token icon from the black one to the blue one
- Fix activity details cid text overflow. #1167
- Remove add to contacts checkbox when the receiver already exists in contacts

## 0.49.1 - 2022-02-25

### Added

- Have message default to asset caption when send
- Update edit asset caption help text
- Display edit icon when no caption

### Fixed

- Removed the new introductory UI/UX for new users

## 0.49.0 - 2022-02-21

### Added

- Add NUM balance loading indicator
- Add hyperlink for users to view NUM wallet transaction history on EtherScan/BscScan
- New introductory UI/UX for new users

### Fixed

- Show custody wallet balance instead of Capture wallet balance
- Fix null message overwriting asset caption when send. #1166

## 0.48.1 - 2022-02-11

### Fixed

- Avoid bluetooth initialization at App startup.

## 0.48.0 - 2022-02-10

### Fixed

- Unuploaded Captures disappear after user pulls to refresh. #918

## 0.47.0

### Added

- Add GoPro support (hidden by default)

###

## 0.46.0

### Added

- Support NUM payment for network applications.

### Changed

- Do not show the private key directly. Users need to agree with the warnings to see and copy their private key.

## 0.45.1 - 2022-01-05

### Fixed

- Make the default language of Camera UI to be `en` instead of `zh-TW`.

## 0.45.0 - 2021-12-28

### Added

- Can edit caption of Captures.
- Show warnings when users try to copy private key.

## 0.44.1 - 2021-12-20

### Fixed

- Show "Deregister from network" option when uploading is not completed.

## 0.44.0 - 2021-12-15

### Changed

- Change network application dialog to support selection input and input validation.

### Fixed

- Do not show Capture options menu when post-creation workflow has not been completed yet

## 0.43.1 - 2021-12-08

### Fixed

- Fix camera activity issue on Android 11 (API level 30).

## 0.43.0 - 2021-11-23

### Changed

- Show ERC20 and BEP20 NUM tokens in profile page.
- Add migration for APPs upgrading from versions before 0.42.0.
- Change network application fields to meet the new Bubble database schema.
- Update Android target version to Android 11 (API level 30).

### Fixed

- Fix Capture icon display issue in signup page.

## 0.42.0 - 2021-10-26

### Added

- Add "More Actions" in the Capture options menu, which will open a page of network applications.
- Support posting Capture in CaptureClub.

### Changed

- Upgrade all dia-backend API to v3.
- Change the "send" icon to "share" icon in Capture Details page.

## 0.41.0 - 2021-10-20

### Added

- Can see caption of every Capture
- Can see NFT address and token ID of every Capture

### Changed

- Update "Public Key" text to "Wallet Address" in Profile page
- Update colors, icon, and splash screen to the new brand theme

## 0.40.3 - 2021-09-27

### Fixed

- Incorrect verification code length validation caused by improper input type.

## 0.40.2 - 2021-09-24

### Fixed

- Missing trusted client key variable settings in GitHub workflow template.
- Remove the ownership transfer restriction for not-from-store Captures.

## 0.40.1 - 2021-09-24

### Fixed

- Missing CI trusted client key variable

## 0.40.0 - 2021-09-22

### Added

- Show CAPT balance in profile page
- Can mint NFT token for asset in capture options menu
- Can either "Copy IPFS link" or "Share C2PA photo" by clicking the send button

### Changed

- Create asset using v3 API
- Change descriptions for actions in capture option menu

### Fixed

- Dark mode display issue on Android devices

## 0.39.1 - 2021-09-07

### Fixed

- Phone verification code form duplicate paste issue. #839
- Homepage side menu display issue.

## 0.39.0 - 2021-09-03

### Added

- Add syncing mechanism with backend asset wallet to use consistent signing keys even if App is uninstalled and resinstalled.

### Changed

- Upgrade to Angular 12 and Webpack 5.
- Share CAI-injected photo so that photos can speak for themselves.
  - Shared photo can be parsed by [media-reader](https://authmedia.net/media-reader) only when sharing them as "files". (e.g. sharing with gmail/gdrive, etc)
    - iOS: Share as "saving to files" instead of "saving to photos".
    - APPs like instagram, facebook will compress the photo and the photo can not be parsed with our [media-reader](https://authmedia.net/media-reader).

### Fixed

- Show capture images/videos in their original aspect instead of fixed 1:1 ratio, which will usually crop them.

## 0.38.1 - 2021-09-03

### Changed

- Update iOS permission usage description.

## 0.38.0 - 2021-08-24

### Added

- Allow sending PostCapture acquired from store.
- Can pull down to refresh Capture tab to sync with backend.

### Changed

- Add back all changes in 0.36.0 and fixed dark mode display issue.

## 0.37.0 - 2021-08-12

### Changed

- Revert all changes in 0.36.0

## 0.36.0 - 2021-07-27

### Added

- Add phone verification and email verification feature. #781 #783

- Darkmode for Android and iOS. #678 #782 #796

### Changed

- Generate v2 signed message and signature and migrate data when upgrading. #778 #779

- Activity text `Accepted` changed to `Received`.

### Fixed

- iOS video recording display issue. #747

## 0.35.0 - 2021-07-16

### Added

- Attach user token when opening CaptureClub within the App.

## 0.34.4 - 2021-07-07

### Fixed

- Fix broken-image icon appears in 0.34.3
- Add a check to fix incorrect thumbnail file-extensions when loading URLs

## 0.34.3 - 2021-07-07

### Fixed

- Improve Home page initial loading time and UX.
- Fix video range request issue on Android. #754

## 0.34.2 - 2021-07-05

### Fixed

- Use sha256sum instead of full file content base64 to reduce serialized `signedTargets` size to avoid crashing caused by signing a very large string with Web3.

## 0.34.1 - 2021-06-04

### Fixed

- Remove incomplete dark mode styling

## 0.34.0 - 2021-05-27

### Added

- Show different background color based on collection type.
- Implement checkbox to add PostCapture receiver to contacts.

### Fixed

- Avoid prefetching `DiaBackendAsset`s without `source_transaction`.

## 0.33.1 - 2021-05-26

### Fixed

- Show PostCaptures transfered back to its original owner.
- Fix height of media on `SendingPostCapturePage`.

## 0.33.0 - 2021-05-25

### Added

- Open certificate on clicking media ID.
- Show store icon on PostCapture grid if from store.

### Changed

- Use ETH wallet signature. #692
- Fix media height on `DetailsPage`.
- Show loading animation on media background.
- Bump node.js version to 16.2.0.

### Fixed

- Avoid screen rotation on iOS. #700

## 0.32.2 - 2021-05-21

### Fixed

- Add back the missing information page.
- Fix details page toolbar oversize on iOS devices. #691
- Align slides on details page to top.

## 0.32.1 - 2021-05-19

Re-release due to exception in Action workflow.

## 0.32.0 - 2021-05-19

### Added

- Implement swipable details page. #689
- Support PostCapture transfer. #687
- Support PostCapture deletion. #686

### Changed

- Display **Not Disclosed** if no created timestamp.
- Remove email icon on friend-invitation dialog.
- Fix geolocation coordinate to 6 digits.
- Maintain ignored transactions from DIA backend. #690
- Make series details page readonly.

### Fixed

- Replace deprecated `FirebaseInstanceId` with `FirebaseMessaging` token. #688

## 0.31.2 - 2021-05-17

### Fixed

- Remove email icon on `friend-invitation-dialog`.
- Allow thumbnail not found error from DIA backend and show broken image icon if thumbnail cannot be found.
- Fix floating point of geolocation to 6 digits.

## 0.31.1 - 2021-05-13

### Added

- Show video recording limitation dialog.

### Fixed

- Support large media as Capture assets. #683

### Changed

- Allow `deploy-app-store` in `pre-release` workflow to be failed.

## 0.31.0 - 2021-05-11

### Added

- Support video recording.
- Support GIF as Capture media asset.
- Add Play and App Store badges on README.

### Changed

- Reorganize shared services, components and modules.

## 0.30.6 - 2021-05-17

Re-release for exceptions occur in pre-release workflow.

## 0.30.5 - 2021-05-17

### Fixed

- Replace `DiaBackendAsset.parsed_meta.mime_type` with `DiaBackendAsset.asset_file_mime_type` to avoid undefined value.

## 0.30.4 - 2021-05-10

Re-release for exceptions occur in pre-release workflow.

## 0.30.3 - 2021-05-10

### Fixed

- Switch to Capture tab (the leftmost) after clicking capture button.

## 0.30.2 - 2021-05-08

### Fixed

- Revert accidentally reverted home page tab order and icons.

## 0.30.1 - 2021-04-30

### Fixed

- Fix typo: `BETTERY_LEVEL` -> `BATTERY_LEVEL`.

### Changed

- Move CaptureClub link from tab buttons to side menu.
- Revert Sentry error report integration.

## 0.30.0 - 2021-04-28

### Added

- Integrate Sentry error report. #641

## 0.29.2 - 2021-04-21

### Fixed

- Show optional menus without network connection on capture-details page.

## 0.29.1 - 2021-04-20

Re-release to update Android `versionCode`.

## 0.29.0 - 2021-04-20

### Added

- Show video icon on thumbnail if the media type is video. #629
- Catch and toast error messages on HTTP error responses.
- Enable CaptureClub.

### Fixed

- Fix orientation bug on Android API 26.
- Replace `MatBottomSheet` with `ActionSheetController` to handle Android back button. #628
- Change NS usage description to English.

## 0.28.0 - 2021-04-13

### Added

- Support video view. #627
- Re-add series view.

## 0.27.12 - 2021-04-27

### Fixed

- Show IPFS supporting files if the URL is valid.

### Changed

- Move the order of optional menus on PostCapture details page.

## 0.27.11 - 2021-04-27

### Fixed

- Remove view on CaptureClub option on Capture details page.

## 0.27.10 - 2021-04-27

### Changed

- View IPFS supporting files on in-app browser.
- Show view CaptureClub option if the source of the DIA backend asset is 'store'.

## 0.27.9 - 2021-04-26

This release is for CaptureClub beta-launch event. Thus, we need to fix the
minor version to 27 even though we have added features.

### Added

- Show supporting video on IPFS. #640
- Add option to view asset on CaptureClub.

## 0.27.8 - 2021-04-23

### Changed

- Remove CaptureClub in home drawer.

## 0.27.7 - 2021-04-23

### Changed

- Revert home tab icons.

## 0.27.6 - 2021-04-22

### Changed

- Move CaptureStore tab to drawer.
- Update tutorial screenshots.

### Fixed

- Update i18n for NS usage descriptions.

## 0.27.5 - 2021-04-20

### Fixed

- Update `EndBug/version-check` to v2 to avoid `TypeError: Cannot read property 'id' of undefined`.

## 0.27.4 - 2021-04-20

### Fixed

- Change NS usage description to English.

## 0.27.3 - 2021-04-13

### Fixed

- Remove tab change animation to avoid the waiting time after capturing.
- Update optional icons on tutorial images. #626

## 0.27.2 - 2021-04-12

### UI/UX

- Show tutorial for store/series release. #622
- Change `selectedIndex` of home tabs to capture tab after capturing. #623

### Fixed

- Replace series view and store tab with coming soon images. #625
- Update tutorial images and text.

## 0.27.1 - 2021-04-08

### UI/UX

- Update tutorial pages.
- Remove mock from-store icons.

### Code Quality

- Bump dependecies and enable dependabot integration.

### Fixed

- Replace `ion-img` with `img` to avoid a lazy loading bug. `72b260`

## 0.27.0 - 2021-04-07

### Added

- Connect series page with DIA backend series APIs. #618

### Performance

- Improve performance of loading image thumbnail after capturing. #616

### Code Quality

- Enable production mode.

## 0.26.1 - 2021-04-02

### Fixed

- Show offline icon on avatar when no network connection. #615
- Refresh PostCaptures correctly with local cache. #614

## 0.26.0 - 2021-04-01

### Added

- Show editable avatar on profile page. #608

### UI/UX

- Move network status bar below `ion-segment` on PostCapture tab for consistency. #607
- Make contacts header style consistent with other headers. #605
- Prevent user from dismissing prefetch dialog by clicking backdrop.

### Performance

- Use native `getUri` when reading large image. #604

### Code Quality

- Enable AOT on build.
- Migrate linter from TSLint to ESLint.
- Use lodash-es for tree-shaking.

## 0.25.0 - 2021-03-30

### Added

- Show network status bar on PostCapture tab. #601
- Cache PostCaptures in memory. #600
- Implement fullscreen image viewer. #602
- Implement contacts page to remove contacts. #599

### Code Quality

- Upgrade Angular from 10.0 to 11.0. #603

## 0.24.0 - 2021-03-26

### Added

- Show avatar on contact selection dialog. #597

### UI/UX

- Display username instead of email. #590
- Change the order of Store tab.
- Change in-app browser toolbar color to the primary color of the theme.

### Fixed

- Avoid fetching expired PostCaptures created before onboarding timestamp. #596

## 0.23.0 - 2021-03-23

### Added

- Open store with in-app browser. #588

### Fixed

- Implement better validation geolocation for showing geo icon. #588

## 0.22.2 - 2021-03-19

### Fixed

- Revert #576 for stable performance on mobile devices. #580
- Refresh PostCaptures when accept transaction. #581
- Fetch returned PostCaptures on app start. #587

## 0.22.1 - 2021-03-16

### Fixed

- Swap the order of PostCapture and Capture tabs. #577

## 0.22.0 - 2021-03-16

### Added

- Implement series page with placeholding data. #574

### Performance

- Get thumbnail source with native URI instead of DataURL. #576

### Fixed

- Open Google maps with internal browser instead of external app.

## 0.21.1 - 2021-03-12

### Added

- Prefetch 9 PostCaptures upon initializing PostCapture tab. #572

### UI/UX

- Remove geolocation icons on PostCapture tab. #569
- Display username instead of email on PostCapture details page. #570

### CI/CD

- Save iOS build number only if the version number increased.

### Fixed

- Add the missing translations on PostCapture details page. #571

## 0.21.0 - 2021-03-10

### Added

- Implement avatar uploading. #565
- Display profile information on Capture tab. #562

### Changed

#### UI/UX

- Update the layout of PostCapture tab to grid layout. #564
- Revert string 'Moment' to 'Capture'. #566
- Display username instead of email on Capture details page. #563

#### CI/CD

- Add upload-google-drive-qa job to pre-release workflow.

## 0.20.1 - 2021-02-25

### Fixed

- Change the app name from Capture Lite to Capture for iOS.

## 0.20.0 - 2021-02-24

### Added

- Add username editing. #550
- Open Google Maps with extenrnal URL on clicking localtion info. #548
- Implement password-resetting dialog. #549

### Changed

#### Performance

- Improve register performance. #551

## 0.19.1 - 2021-02-19

### Fixed

- Remove calling `logout` endpoints on logging out. #547

### Changed

#### CI/CD

- Show build number on Slack message. #546

## 0.19.0 - 2021-02-19

### Added

- Remove all user data on logging out. #545

### Changed

#### CI/CD

- Add CI/CD for iOS. #544

## 0.18.0 - 2021-02-05

### Added

- Implement options menu for `PostCaptureCard`. #536

### Changed

#### UI/UX

- Update the title of error dialog on prefetching. #533
- Reduce the size of PostCapture sender email. #530
- Disable tab pagination on `HomPage`. #537
- Adjust he position and size of the capture status-preview icons. #537
- Remove the title on `CaptureDetailsPage`. #538

## 0.17.1 - 2021-02-03

### Changed

#### UI/UX

- Display stroked status style on transactions page if the asset is not owned by the user. #526
- Update tutorial images. #527, #524
- Adjust the items of options menu on capture-details page. #525
- Replace media-query with safe-area properties. #525

#### Authentication

- Remove email confirmation page after signup as users no longer need to verify their emails before using the app. #523

## 0.17.0 - 2021-02-01

### Added

- Implement capture sharing. #499
- Show capture status icons on capture-tab. #509
- Show certificate on authmedia by clicking media ID. #512

### Fixed

- Remove new year frame when sharing. #507
- Fix error handling on login `HttpErrorResponse`. #508
- Remove "view more" information on `PostCaptureCard` #510

## 0.16.5 - 2021-01-29

Re-release due to an internal error on releaseing.

## 0.16.4 - 2021-01-29

### Fixed

- Fix unintended pre-fetching conditions. #501

## 0.16.3 - 2021-01-29

### Changed

#### UI/UX

- Adjust tutorial slides layout.

## 0.16.2 - 2021-01-29

Re-release due to an internal error on releaseing.

## 0.16.1 - 2021-01-29

### Fixed

- Force screen orientation to portrait on Android devices to avoid layout error.
- Adjust tutorial layout and i18n. #498

## 0.16.0 - 2021-01-28

### Added

- Show error dialog on pre-fetching errors. #496

### Changed

#### UI/UX

- Format tutorial pages. #495
- Move tab toolbar to bottom on home page. #493

#### I18n

- Use "moment" to replace "photo". #497

## 0.15.7 - 2021-01-27

### Fixed

- Remove beta string on splash screen for Android.

## 0.15.6 - 2021-01-27

### Fixed

- Avoid redundant writing of original image when update `ProofRepository` with `update()`. #489
- Avoid some corner cases when prefetching without network connection. #490
- Prevent prefetching dialog from displaying again when the user decides to skip. #492
- Fix the toolbar height on Activity and CaptureDetails pages in iOS devices. #492

## 0.15.5 - 2021-01-26

### Fixed

- Remove `isNewLogin` condition wrapping `redirectOnboarding()` on home page.
- Set `isNewLogin` to `false` before checking if to prefetch dialog.
- Set `hasPrefetchedDiaBackendAssets` to `true` after migration.

## 0.15.4 - 2021-01-26

### Fixed

- Migrate `Proof.diaBackendAssetId`. #482
- Determine if pre-fetch by remote asset count. #483

### Changed

#### UI/UX

- Change tab labels to icons. #485

## 0.15.3 - 2021-01-25

### Fixed

- Migrate data only if user logged in first time.
- Add order parameter on querying DIA backend transaction.

## 0.15.2 - 2021-01-25

### Fixed

- Use local font to load icons offline. #479
- Show prefetching/tutorial pages only on first time login. #480

## 0.15.1 - 2021-01-22

Re-release due to an internal error on uploading to Play Store.

## 0.15.0 - 2021-01-22

### Added

- Implement uploading bar. #455
- Resume uploading after reconnection. #457
- Display spinner on loading captures. #459
- Show contact information on about page.
- Implement customized GPS cache policy. #454

### Fixed

- Improve capture performance. #444
- Load PostCaptures from remote only.
- Remove buggy PostCapture deletion feature.

## 0.14.2 - 2021-01-08

### Added

- Display photo directly after captured. #442

## 0.14.1 - 2021-01-06

### Fixed

- WORKAROUND: remove asset cache and refresh asset after sending PostCapture.
- Use `shareReplay({bufferSize: 1, refCount: true})` to replace `share()` to avoid the shared `Observable` from not emitting on subscribe.

## 0.14.0 - 2021-01-05

### Added

- Implement deletion for PostCaptures. #434

### Fixed

- Fix PostCaptures accidentally displayed on Capture tab. #431

## 0.13.0 - 2020-12-25

### Added

- Show resend activation email button on user-not-active-error. #420

### Fixed

- Hide share button on PostCapture preview. #426

## 0.12.2 - 2020-12-22

### Fixed

- Fix iOS native i18n. #418
- Fix font and text position on tutorial page. #410
- Add padding to empty inbox text. #409

## 0.12.1 - 2020-12-19

### Changed

- iOS splash screen has Beta mark now.

### Fixed

- Fix iOS push notifcation issues. #337 #365
- Login will timeout after 20 seconds to prevent infinite loading popup.

## 0.12.0 - 2020-12-18

### Added

- Show tutorial slides when users open the app first time. #376
- Share watermarked PostCapture to other apps. #346

## 0.11.8 - 2020-12-17

### Added

- Show migrating and syncing message on home page. #370

### Fixed

- Avoid captures disappear when loading thumbnails. #361
- Show push notification on foreground and background with Android and iOS devices. #373
- Fix typos.

## 0.11.7 - 2020-12-15

### Added

- Add `beta` string to the splash image. #360

### Fixed

- Sort captures descendingly. #358
- Collect complete device info provided by Capacitor Device plugin. #359

## 0.11.6 - 2020-12-14

### Fixed

- Fix the view-all button out of place in WebKit browser in iOS devices. #348

## 0.11.5 - 2020-12-14

### Changed

#### Code Quality

- Add extension to files stored in `ImageStore`. #345

### Fixed

- Fix drop pictures during capturing. #341
- Change the `background-size` to `cover` for capture thumbs. #343
- Rename `nothing-here` to `empty-inbox`. #342
- Migrate `DiaBackendAuthService`. #340
- Handle geolocation error message for native devices. #328
- **Limitation**: Cannot receive push notification on iOS. Inbox on iOS is only updated when the App is started.

## 0.11.4 - 2020-12-11

### Fixed

- Migrate old assets and proofs by fetching from DIA backend.

## 0.11.3 - 2020-12-11

### Fixed

- Migrate the old `FileStore` to `ImageStore`.

## 0.11.2 - 2020-12-10

### Fixed

- Use `r0adkll/upload-google-play@v1.0.7` to avoid `This edit has already been successfully committed, please create a new Edit.` error.

### Changed

- Remove `npm run test-ci` during pre-release CD.

## 0.11.1 - 2020-12-10

### Fixed

- Update version code for Android to avoid releasing conflicts.

## 0.11.0 - 2020-12-10

### Added

- Show error message with snackbar when fails to get geolocation information. #308, #267
- Show contact list on contact selection dialog. #307, #230
- Improve contacts and transactions loading time with repository pattern. #226
- Implement the re-upload mechanism on publishing Proofs to DIA backend. #321, #217, #292, #212
- Show notification when receive new PostCapture. #310, #295
- Show notification when a PostCapture has expired. #229
- Show a badge indicating new items in inbox. #190
- **WORKAROUND**: Limit to display 10 PostCaptures to avoid #291.

### Changed

#### UI/UX

- Update UI to follow the design. #320

#### Code Quality

- Use repository pattern to implement `DiaBackendContactRepository` and `DiaBackendTransactionRepository`.

### Fixed

- Remove opening dashboard on clicking media ID. #324

## 0.10.0 - 2020-12-08

### Added

- Add transaction-details page. #286
- Display different status badge to distinguish different "In Progress" activity. #199

### Changed

#### Code Quality

- Rewrite the tests of `NotificationService` with `MockLocalNotificationsPlugin`.
- Rewrite tests for `PreferenceManager` service by mocking Capacitor `Storage` plugin.
- Rewrite the interface of `ConfirmAlert` with tests.
- Add tests for `LanguageService`.
- Change the pre-release branch to master.
- Rename `NumbersStorageBackend` with `DiaBackend`.
- Implement `NotificationService.notifyOnGoing` method. Close #254.
- Apply on-going notification to `CollectorService.runAndStore` method.
- Apply on-going notification to `DiaBackendAssetRepository.add` method.
- Reimplement simplified `IgnoredTransactionRepository`.
- Extract `/api/**/transactions` endpoints to standalone service.
- Extract `/api/**/assets` endpoints to standalone service.
- Extract `/auth` endpoints to standalone service with tests.
- Add readonly modifier to most dictionary interface.
- Improve the import location for `secret.ts` from set-secret preconfig.

### Fixed

- Fix white margin on iOS 13.7 iPhone 6s Plus. #289
- Fix background color of the PostCapture image. #285
- Fix unified font size on Capture tab. #284
- Fix cannot scroll on asset page. #282

## 0.9.4 - 2020-12-04

### Changed

#### Code Quality

- Rename `FileStore` to `ImageStore` for self-explanatory naming.

### Fixed

- Lazily generate thumbnail and cache it to reduce memory use. #287, #288

## 0.9.3 - 2020-12-03

### Changed

#### UI/UX

- Remove confusing hash on collecting notifications.

#### Code Quality

- Migrate to Node 14.x. #279
- Add tests for `CapacitorFactsProvider`.
- Add tests for `WebCryptoApiSignatureProvider`.
- Remove `MemoryTable` by mocking Capacitor `Filesystem` plugin. #42
- Implement `ImageStore` to randomly and safely store files with base64 string.
- Extract `serializeSortedSignedTargets` method from `Proof` class and `CollectorService`.

### Fixed

- Fix warning: Form Submission Canceled. #251
- Fix captures cannot be stored on mobile devices. #283
  - Extract binary (base64) string from `Proof.assets` property.
  - Remove the proof after sending the PostCapture.
  - Improve the performance of Proof saving and loading.
  - Reduce the memory use with the operations on `Proof` instances.
  - Use `async` pipe to resolve `Proof` thumbnail independently.
  - Refresh captures on home page only when a `Proof` get published.
- Fix `CapacitorFilesystemTable.initialize` may cause a race condition.

## 0.9.2 - 2020-12-02

### Changed

- Increase the timeout for QA release and Android build to 60 minutes.

## 0.9.1 - 2020-12-01

### Changed

#### Code Quality

- Use `SharedModule` and `SharedTestingModule` to import all common module at once. #253

### Fixed

- Unable to display captures.

## 0.9.0 - 2020-12-01

### Added

- **WORKAROUND**: Store expired PostCapture with a very fragile implementation. #229
- **WORKAROUND**: Polling to get inbox badge count. #190
- Crop image with fixed ratio. #235
- Open dashboard link on clicking asset ID. #197

### Changed

#### UI/UX

- Update UI and color theme. #228
- Remove notification after a proof published or collected.

#### Code Quality

- Create GitHub Release page only if deploy on Play Console successfully.
- Refactor `Proof` class. #252
- Add formatter and linters. #180
- Refactor `NotificationService` with mock for test. #236
- Use `Promise` to replace `Observable` only emitting once. #233

### Fixed

- Fix PostCapture UI. #276
- Align title in header to center. #260
- Update style of the "View-All" button on the capture details page. #260
- Fix the ripple effects for buttons. #260
- Fix the scrolling on PostCapture tab. #260
- Fix warning: `ExpressionChangedAfterItHasBeenCheckedError` #260

### Docs

- Remove demo app section on README.

## 0.8.1 - 2020-11-26

### Fixed

- Update `r0adkll/upload-google-play` from v1.0.4 to v1 to avoid using deprecated `set-env` command in Action.

## 0.8.0 - 2020-11-26

### Changed

#### UI/UX

- Require user name on sign-up page. #224
- Show "Nothing here" on inbox page when no item to show. #222
- Rename "publishing proof" to "registering asset" #223, #208
- Update UI components and color scheme to follow the Figma design. #255, #228, #218, #219, #235
- Change the notification small icon to launcher icon. #237

#### Code Quality

- Improve stability and reliability of data persistence. #227

## 0.7.5 - 2020-11-16

### Fixed

- Rename app name to Capture and proof detials to capture details. #201 #202
- Show the sender instead of owner on app-post-capture-card. #198

## 0.7.4 - 2020-11-14

### Fixed

- Release APK connecting to prod-site.

## 0.7.3 - 2020-11-13

### Fixed

- **Workaround**: Catch Error from Capacitor.Filesystem.deleteFile on Android or iOS Devices. #193

## 0.7.2 - 2020-11-13

### Fixed

- **Workaround**: fix different naming for information. Use constant string for the names of information.
- Fix location cannot display on asset page in zh-tw. #187

## 0.7.1 - 2020-11-13

### Fixed

- No response on clicking Ignore button the on inbox page. #184
- The copy button of the media ID on the asset page only copy "mid-here" string to the clipboard. #185
- The operations in `Plugin.BackgroundTask` from Capacitor is running outside of `ngZone`, which causes the change detection fails. #186

## 0.7.0 - 2020-11-12

### Added

- PostCapture MVP. #182, #170, #171
- Add terms and policy links to singup page.

### Changed

#### UI/UX

- Update UI design. #178

### Fixed

- Fix toolbars (headers) overlap on iOS devices. #179

## 0.6.0 - 2020-11-08

### Added

- Build capture wall. #141
- Build pages for contact selection and sending PostCapture. #143, #147
- Configure the CD with GitHub Action to deploy Android release to Google Play Console on QA release. #144

### Changed

#### Code Quality

- Remove unnecessary `header.component`. #151
- Merge the `internal` branch into `develop`. From now on, we only maintain the develop branch with secrets environment variables to access storage backend.
- Improve the architecture for router guards.

#### UI/UX

- Rebuild most pages with `@angular/material` library, including: #160
  - rebuild `storage.page` with PostCapture tab
  - rebuild `about.page`
  - add `profile.page`
  - add `privacy.page`
  - rebuild `settings.page`
  - rebuild `proof.page`
  - rebuild `information.page` #142
  - rebuild `signup.page`
  - rebuild `login.page`
- Remove unnecessary abstraction in UI:
  - multiple publishers on `settings.page`
  - multiple information providers on `information.page`
  - multiple signatures on `information.page`
- Update Ionic color theme to be consistent with design and `@angular/material`.

### Fixed

- Cascadingly remove proof thumb. #149
- Fix `this.router.navigate.(['..'])` not working bug.

## 0.5.1 - 2020-10-14

### Fixed

- Add missing zh-TW translations.

## 0.5.0 - 2020-10-13

### Added

- Add zh-Tw language support.
- Add login and signup pages.

## 0.4.1 - 2020-09-24

### Fixed

- Revert the accidentally overridden drawer menu.

## 0.4.0 - 2020-09-23

### Added

- Add settings and drawer. #97
- Group photos by date. #95
- Add ALL/TAG view modes on the storge page.
- Add iOS platform support.

## 0.3.0 - 2020-09-07

### Changed

#### Code Quality

- Improve storage performance. #85

### Fixed

- Fix the app does not catch the image from external camera app when the available memory is low on Android. #83

## 0.2.0 - 2020-08-19

### Added

- Display version on the settings page. #20
- Implement the preferences for CapacitorProvider. #24
- Implement numbers-storage publisher. #28 #25
- Add launcher icon and splash screen. #22

### Changed

#### API

- Use PKCS#8 and SubjectPublicKeyInfo format in ECDSA signatures.
- Change the format of SortedProofInformation to be the same as Starling Capture.

#### UI/UX

- Make the proof deletion a blocking action.

#### Code Quality

- Enable TypeScript strict checks. #19
- Replace ngx-translate with transloco library. #18
- Update dependencies and enable dependabot. #30
- Enable Codacy with coverage. #41

### Fixed

- Fix race conditions caused by Promise is eagerly created in switchMapTo(), concatMapTo(), or mergeMapTo() by wrapping the promise with defer().

## 0.1.0 - 2020-07-27

This is the first release! _Capture Lite_ is a cross-platform app adapted from [Starling Capture app](https://github.com/numbersprotocol/starling-capture).

### Added

#### Components

- Media Source
  - Picture captured from the internal camera
- Information Provider
  - Capacitor built-in `Device` and `Geolocation` plugins
- Signature Provider
  - Web Crypto API
- Publisher
  - Sample publisher - a sample publisher does nothing

#### Supported Platforms

- Web - see the demo [here](https://github.com/numbersprotocol/capture-lite#demo-app)
- Android - the APK file `app-debug.apk` is attached to this release

[unreleased]: https://github.com/numbersprotocol/capture-lite/compare/0.101.1...HEAD
[0.101.1]: https://github.com/numbersprotocol/capture-lite/compare/0.101.0...0.101.1
[0.101.0]: https://github.com/numbersprotocol/capture-lite/compare/0.100.0...0.101.0
[0.100.0]: https://github.com/numbersprotocol/capture-lite/compare/0.99.0...0.100.0
[0.99.0]: https://github.com/numbersprotocol/capture-lite/compare/0.98.0...0.99.0
[0.98.0]: https://github.com/numbersprotocol/capture-lite/compare/0.97.1...0.98.0
[0.97.1]: https://github.com/numbersprotocol/capture-lite/compare/0.97.0...0.97.1
[0.97.0]: https://github.com/numbersprotocol/capture-lite/compare/0.96.0...0.97.0
[0.96.0]: https://github.com/numbersprotocol/capture-lite/compare/0.95.1...0.96.0
[0.95.1]: https://github.com/numbersprotocol/capture-lite/compare/0.95.0...0.95.1
[0.95.0]: https://github.com/numbersprotocol/capture-lite/compare/0.94.0...0.95.0
[0.94.0]: https://github.com/numbersprotocol/capture-lite/compare/0.93.0...0.94.0
[0.93.0]: https://github.com/numbersprotocol/capture-lite/compare/0.92.0...0.93.0
[0.92.0]: https://github.com/numbersprotocol/capture-lite/compare/0.91.0...0.92.0
[0.91.0]: https://github.com/numbersprotocol/capture-lite/compare/0.90.0...0.91.0
[0.90.0]: https://github.com/numbersprotocol/capture-lite/compare/0.89.2...0.90.0
[0.89.2]: https://github.com/numbersprotocol/capture-lite/compare/0.88.8...0.89.2
[0.88.8]: https://github.com/numbersprotocol/capture-lite/compare/0.88.6...0.88.8
[0.88.6]: https://github.com/numbersprotocol/capture-lite/compare/0.87.1...0.88.6
[0.87.1]: https://github.com/numbersprotocol/capture-lite/compare/0.87.0...0.87.1
[0.87.0]: https://github.com/numbersprotocol/capture-lite/compare/0.86.4...0.87.0
[0.86.4]: https://github.com/numbersprotocol/capture-lite/compare/0.83.2...0.86.4
[0.83.2]: https://github.com/numbersprotocol/capture-lite/compare/0.82.4...0.85.2
[0.82.4]: https://github.com/numbersprotocol/capture-lite/compare/0.82.4...0.83.2
[0.82.4]: https://github.com/numbersprotocol/capture-lite/compare/0.82.3...0.82.4
[0.82.3]: https://github.com/numbersprotocol/capture-lite/compare/0.82.2...0.82.3
[0.82.2]: https://github.com/numbersprotocol/capture-lite/compare/0.81.2...0.82.2
[0.81.2]: https://github.com/numbersprotocol/capture-lite/compare/0.79.0...0.81.2
[0.79.0]: https://github.com/numbersprotocol/capture-lite/compare/0.78.0...0.79.0
[0.78.0]: https://github.com/numbersprotocol/capture-lite/compare/0.77.2...0.78.0
[0.77.2]: https://github.com/numbersprotocol/capture-lite/compare/0.77.1...0.77.2
[0.77.1]: https://github.com/numbersprotocol/capture-lite/compare/0.77.0...0.77.1
[0.77.0]: https://github.com/numbersprotocol/capture-lite/compare/0.75.2...0.77.0
[0.75.2]: https://github.com/numbersprotocol/capture-lite/compare/0.75.1...0.75.2
[0.75.1]: https://github.com/numbersprotocol/capture-lite/compare/0.75.0...0.75.1
[0.75.0]: https://github.com/numbersprotocol/capture-lite/compare/0.74.2...0.75.0
[0.74.2]: https://github.com/numbersprotocol/capture-lite/compare/0.74.1...0.74.2
[0.74.1]: https://github.com/numbersprotocol/capture-lite/compare/0.74.0...0.74.1
[0.74.0]: https://github.com/numbersprotocol/capture-lite/compare/0.73.1...0.74.0
[0.73.1]: https://github.com/numbersprotocol/capture-lite/compare/0.72.4...0.73.1
[0.72.4]: https://github.com/numbersprotocol/capture-lite/compare/0.72.3...0.72.4
[0.72.3]: https://github.com/numbersprotocol/capture-lite/compare/0.72.2...0.72.3
[0.72.2]: https://github.com/numbersprotocol/capture-lite/compare/0.72.1...0.72.2
[0.72.1]: https://github.com/numbersprotocol/capture-lite/compare/0.72.0...0.72.1
[0.72.0]: https://github.com/numbersprotocol/capture-lite/compare/0.71.2...0.72.0
[0.71.2]: https://github.com/numbersprotocol/capture-lite/compare/0.71.1...0.71.2
[0.71.1]: https://github.com/numbersprotocol/capture-lite/compare/0.71.0...0.71.1
[0.71.0]: https://github.com/numbersprotocol/capture-lite/compare/0.70.0...0.71.0
[0.70.0]: https://github.com/numbersprotocol/capture-lite/compare/0.69.3...0.70.0
[0.69.3]: https://github.com/numbersprotocol/capture-lite/compare/0.69.2...0.69.3
[0.69.2]: https://github.com/numbersprotocol/capture-lite/compare/0.69.1...0.69.2
[0.69.1]: https://github.com/numbersprotocol/capture-lite/compare/0.69.0...0.69.1
[0.69.0]: https://github.com/numbersprotocol/capture-lite/compare/0.68.0...0.69.0
[0.68.0]: https://github.com/numbersprotocol/capture-lite/compare/0.67.1...0.68.0
[0.67.1]: https://github.com/numbersprotocol/capture-lite/compare/0.67.0...0.67.1
[0.67.0]: https://github.com/numbersprotocol/capture-lite/compare/0.66.3...0.67.0
[0.66.3]: https://github.com/numbersprotocol/capture-lite/compare/0.66.2...0.66.3
[0.66.2]: https://github.com/numbersprotocol/capture-lite/compare/0.66.1...0.66.2
[0.66.1]: https://github.com/numbersprotocol/capture-lite/compare/0.66.0...0.66.1
[0.66.0]: https://github.com/numbersprotocol/capture-lite/compare/0.65.0...0.66.0
[0.65.0]: https://github.com/numbersprotocol/capture-lite/compare/0.64.4...0.65.0
[0.64.4]: https://github.com/numbersprotocol/capture-lite/compare/0.64.3...0.64.4
[0.64.3]: https://github.com/numbersprotocol/capture-lite/compare/0.64.2...0.64.3
[0.64.2]: https://github.com/numbersprotocol/capture-lite/compare/0.64.1...0.64.2
[0.64.1]: https://github.com/numbersprotocol/capture-lite/compare/0.64.0...0.64.1
[0.64.0]: https://github.com/numbersprotocol/capture-lite/compare/0.63.2...0.64.0
[0.63.2]: https://github.com/numbersprotocol/capture-lite/compare/0.63.1...0.63.2
[0.63.1]: https://github.com/numbersprotocol/capture-lite/compare/0.63.0...0.63.1
[0.63.0]: https://github.com/numbersprotocol/capture-lite/compare/0.62.0...0.63.0
[0.62.0]: https://github.com/numbersprotocol/capture-lite/compare/0.61.2...0.62.0
[0.61.2]: https://github.com/numbersprotocol/capture-lite/compare/0.61.1...0.61.2
[0.61.1]: https://github.com/numbersprotocol/capture-lite/compare/0.61.0...0.61.1
[0.61.0]: https://github.com/numbersprotocol/capture-lite/compare/0.60.4...0.61.0
[0.60.4]: https://github.com/numbersprotocol/capture-lite/compare/0.60.3...0.60.4
[0.60.3]: https://github.com/numbersprotocol/capture-lite/compare/0.60.2...0.60.3
[0.60.2]: https://github.com/numbersprotocol/capture-lite/releases/tag/0.60.2
