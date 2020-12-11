# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.11.3 - 2020-12-11

### Fixed

- Migrate the old `FileStore` to `ImageStore`.

## 0.11.2 - 2020-12-10

### Fixed

- Use `r0adkll/upload-google-play@v1.0.7` to avoid `This edit has already been successfully committed, please create a new Edit.` error.

### Change

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
