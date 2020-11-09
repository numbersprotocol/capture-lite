# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Implement numbers-storage publisher. [internal] #28 #25
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