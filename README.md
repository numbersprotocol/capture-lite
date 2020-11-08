# Capture Lite

| branch  | build | coverage | quality |
|:-------:|:-----:|:--------:|:-------:|
| master  | [![build](https://github.com/numbersprotocol/capture-lite/workflows/build/badge.svg)](https://github.com/numbersprotocol/capture-lite/actions?query=workflow%3Abuild) | [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/45ae18aaa6a7474497e0efd818452a46)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Coverage) | [![Codacy Badge](https://app.codacy.com/project/badge/Grade/45ae18aaa6a7474497e0efd818452a46)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=numbersprotocol/capture-lite&amp;utm_campaign=Badge_Grade) |
| develop | [![build](https://github.com/numbersprotocol/capture-lite/workflows/build/badge.svg?branch=develop)](https://github.com/numbersprotocol/capture-lite/actions?query=workflow%3Abuild) | [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/45ae18aaa6a7474497e0efd818452a46?branch=develop)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Coverage) | [![Codacy Badge](https://app.codacy.com/project/badge/Grade/45ae18aaa6a7474497e0efd818452a46?branch=develop)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=numbersprotocol/capture-lite&amp;utm_campaign=Badge_Grade)

## Highlight Features

* Generate digital proofs on media assets created.
* WIP: Publish digital proofs to decentralized networks.

## Demo App

![preview](https://i.imgur.com/VRXhKo3.png)

[The demo app](https://numbersprotocol.github.io/capture-lite/) is hosted on GitHub Page. You can simulate the mobile device by [toggling device mode with Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools/device-mode).

## Getting Started

Node.js 10.16.0+ is required.

Install the dependencies.

``` bash
npm i
```

Set the system environment variable `NUMBERS_STORAGE_BASE_URL` before build the app by appending the following string in `~/.profile`:

``` txt
export NUMBERS_STORAGE_BASE_URL="THE PRIVATE BASE URL"
```

Preview the app in web browser.

``` bash
npm run serve
```

### Verification

The signature of proofs can be verified with [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). The signed message is generated by `services/serialization/serialization.service.ts#stringify()` method. A Python example for verification can be found in [the Starling Capture repository](https://github.com/numbersprotocol/starling-capture/tree/master/util/verification).

## Development

Start a local dev server for app dev/testing.

``` bash
ionic serve
```

Run tests.

``` bash
npm run test
```

Run tests in headless mode.

``` bash
npm run test-ci
```

Lint the projects.

``` bash
npm run lint
```

[Update `cordova-res` (splash screens and launcher icons)](https://capacitorjs.com/docs/guides/splash-screens-and-icons).

``` bash
cordova-res android --skip-config --copy
```

### Contribution

* The committed codes should pass all GitHub workflows.
* Avoid using getters/setters in TypeScript so [the linter for RxJS can correctly identify the unsafe scope](https://github.com/cartant/rxjs-tslint-rules#rxjs-no-unsafe-scope).

### Platform

#### Android

If your operating system is Linux, set the `linuxAndroidStudioPath` in `capacitor.config.json`. For example,

``` json
{
  "linuxAndroidStudioPath": "/home/username/android-studio/bin/studio.sh"
}
```

Before running the app with Android Studio, build and sync the dependencies and web assets.

``` bash
npm run build
npx cap sync
```

Open the project in Android Studio.

``` bash
npx cap open android
```

The script does the same thing for you.

``` bash
npm run build-android
```

### Architecture

See [the architecture of Starling Capture](https://github.com/numbersprotocol/starling-capture#architecture) for details.

### Serialization Schema

See [the serialization schema of Starling Capture](https://github.com/numbersprotocol/starling-capture#serialization-schema) for details.

### Caveat

* This app is still in the experimental stage.
* This app uses raw file system to save proofs, and thus the performance is not optimized.

### Release

Bump version in `package.json`.

``` json
{
  "version": "a.b.c"
}
```

Bump version in `android/app/build.gradle`.

``` gradle
android {
    defaultConfig {
        versionCode abc
        versionName "a.b.c"
    }
}
```

__Remember to write the changelog in `CHANGELOG.md`.__

When push to the `develop` branch with new version in the `package.json` file, GitHub Action would automatically do the following jobs:

1. Create release GitHub page with debug APK.
1. Publish the app to Play Console on alpha track.
1. Upload debug apk to Google Drive.
1. Send notification to the private `reminder-releases` slack channel.

### Deploy

#### Demo App

The demo app is hosted on the GitHub Page. It would be updated when there is a new commit on the `master` branch.