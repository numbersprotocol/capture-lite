# Capture Lite

| branch  |                                                                                        build                                                                                         |                                                                                                                                        coverage                                                                                                                                         |                                                                                                                                      quality                                                                                                                                      |
| :-----: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| master  |        [![build](https://github.com/numbersprotocol/capture-lite/workflows/build/badge.svg)](https://github.com/numbersprotocol/capture-lite/actions?query=workflow%3Abuild)         |        [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/45ae18aaa6a7474497e0efd818452a46)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Coverage)         |        [![Codacy Badge](https://app.codacy.com/project/badge/Grade/45ae18aaa6a7474497e0efd818452a46)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Grade)         |
| develop | [![build](https://github.com/numbersprotocol/capture-lite/workflows/build/badge.svg?branch=develop)](https://github.com/numbersprotocol/capture-lite/actions?query=workflow%3Abuild) | [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/45ae18aaa6a7474497e0efd818452a46?branch=develop)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Coverage) | [![Codacy Badge](https://app.codacy.com/project/badge/Grade/45ae18aaa6a7474497e0efd818452a46?branch=develop)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Grade) |

## Highlight Features

- Generate digital proofs on media assets created.
- WIP: Publish digital proofs to decentralized networks.

## Getting Started

Node 14.15.1+ is required.

Install the dependencies.

```bash
npm i
```

Set the system environment variable `NUMBERS_STORAGE_BASE_URL` before build the app by appending the following string in `~/.profile`:

```txt
export NUMBERS_STORAGE_BASE_URL="THE PRIVATE BASE URL"
```

Preview the app in web browser.

```bash
npm run serve
```

## Development

Start a local dev server for app dev/testing.

```bash
npm run serve
```

Run tests.

```bash
npm run test
```

Run tests in headless mode.

```bash
npm run test-ci
```

Lint the projects.

```bash
npm run lint
```

[Update `cordova-res` (splash screens and launcher icons)](https://capacitorjs.com/docs/guides/splash-screens-and-icons).

```bash
cordova-res android --skip-config --copy
```

### Contribution

- Run `npm run lint` before each commit.
- The committed codes should pass all GitHub checks.
- Use [Visual Studio Code](https://code.visualstudio.com/) with workspace settings for consistent coding style.
- Use [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) to auto format on save.
- Prefer `Promise` than `Observable` when only emitting one value. See [issue #233](https://github.com/numbersprotocol/capture-lite/issues/233).
- Avoid using `toPromise()` to convert `Observable` to `Promise` as [it is an anti-pattern](https://stackoverflow.com/a/49596716/8789738).

### Platform

#### Android

If your operating system is Linux, set the `linuxAndroidStudioPath` in `capacitor.config.json`. For example,

```json
{
  "linuxAndroidStudioPath": "/home/username/android-studio/bin/studio.sh"
}
```

Before running the app with Android Studio, build and sync the dependencies and web assets.

```bash
npm run build
npx cap sync android
```

Open the project in Android Studio.

```bash
npx cap open android
```

The script does the same thing for you.

```bash
npm run build-android
```

### Caveat

- This app is still in the experimental stage.
- This app uses raw file system to save proofs, and thus the performance is not optimized.

### Release

Bump version in `package.json`.

```json
{
  "version": "a.b.c"
}
```

Bump version in `android/app/build.gradle`.

```gradle
android {
    defaultConfig {
        versionCode <versionCode++>
        versionName "a.b.c"
    }
}
```

Run `npm i` to update `package-lock.json`.

Write the changelog in `CHANGELOG.md`.

When push to the `develop` branch with new version in the `package.json` file, GitHub Action would automatically do the following jobs:

1. Create release GitHub page with debug APK.
1. Publish the app to Play Console on alpha track.
1. Upload debug apk to Google Drive.
1. Send notification to the private `reminder-releases` slack channel.
