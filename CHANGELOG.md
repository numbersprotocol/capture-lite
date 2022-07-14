# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.60.2 - 2022-07-07

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

## 0.60.1 - 2022-07-06

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
