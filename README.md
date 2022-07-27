# Capture Lite

<a href='https://play.google.com/store/apps/details?id=io.numbersprotocol.capturelite'><img alt='Get it on Google Play' src='https://i.imgur.com/nqDY3fd.png' height="64"/></a>
<a href='https://apps.apple.com/tw/app/capture-app/id1536388009'><img alt='Get it on Google Play' src='https://i.imgur.com/OdHCgWO.png' height="64"/></a>

| branch  |                                                                                        build                                                                                         |                                                                                                                                        coverage                                                                                                                                         |                                                                                                                                      quality                                                                                                                                      |
| :-----: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| master  |        [![build](https://github.com/numbersprotocol/capture-lite/workflows/build/badge.svg)](https://github.com/numbersprotocol/capture-lite/actions?query=workflow%3Abuild)         |        [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/45ae18aaa6a7474497e0efd818452a46)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Coverage)         |        [![Codacy Badge](https://app.codacy.com/project/badge/Grade/45ae18aaa6a7474497e0efd818452a46)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Grade)         |
| develop | [![build](https://github.com/numbersprotocol/capture-lite/workflows/build/badge.svg?branch=develop)](https://github.com/numbersprotocol/capture-lite/actions?query=workflow%3Abuild) | [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/45ae18aaa6a7474497e0efd818452a46?branch=develop)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Coverage) | [![Codacy Badge](https://app.codacy.com/project/badge/Grade/45ae18aaa6a7474497e0efd818452a46?branch=develop)](https://www.codacy.com/gh/numbersprotocol/capture-lite?utm_source=github.com&utm_medium=referral&utm_content=numbersprotocol/capture-lite&utm_campaign=Badge_Grade) |

## Getting Started

Node 16.2.0+ and NPM 7.13.0+ is required.

Install the dependencies.

```bash
npm i
```

Set the system environment variables `NUMBERS_STORAGE_BASE_URL`, `NUMBERS_STORAGE_TRUSTED_CLIENT_KEY`, and `NUMBERS_BUBBLE_DB_URL` before building the app by appending the following string in `~/.profile`:

```txt
export NUMBERS_STORAGE_BASE_URL="THE PRIVATE BASE URL"
export NUMBERS_STORAGE_TRUSTED_CLIENT_KEY="THE TRUSTED CLIENT KEY"
export NUMBERS_BUBBLE_DB_URL="THE BUBBLE DB URL"
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
npm run test.ci
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

If your operating system is Linux, set the environment variable `CAPACITOR_ANDROID_STUDIO_PATH` for your Android Studio. The default value is `/usr/local/android-studio/bin/studio.sh`.

```sh
export CAPACITOR_ANDROID_STUDIO_PATH="/home/username/android-studio/bin/studio.sh"
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
npm run build.android
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
        versionCode <versionCode += a_diff*100 + b_diff*10 + c_diff>
        versionName "a.b.c"
    }
}
```

Run `npm i` to update `package-lock.json`.

Write the changelog in `CHANGELOG.md`.

When push to the `master` branch with new version in the `package.json` file, GitHub Action would automatically do the following jobs:

1. Create release GitHub page with debug APK.
1. Publish the app to Play Console on alpha track.
1. Upload debug apk to Google Drive.
1. Send notification to the private `reminder-releases` slack channel.

If error occur in `deploy-app-store` GitHub Action, most likely it's due to some weird error with GitHub MacOS runner or iOS server. Re-run the failed job should fix that. However, you might run into

```
Error: Validation Failed: {"resource":"Release","code":"already_exists","field":"tag_name"}
```

In this case, you could delete the releae tag by doing `git push --delete origin tagname`. E.g. `git push --delete origin 0.53.0`.
