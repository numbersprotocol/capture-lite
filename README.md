# Capture Lite

[![Node.js CI](https://github.com/numbersprotocol/capture-lite/workflows/Node.js%20CI/badge.svg)](https://github.com/numbersprotocol/capture-lite/actions?query=workflow%3A%22Node.js+CI%22)

## Development

### Android

Before running the app with Android Studio, build and sync the dependencies and web assets.

``` bash
ionic build
npx cap sync
```

If your operating system is Linux, set the `linuxAndroidStudioPath` in `capacitor.config.json`. For example,

``` json
{
  "linuxAndroidStudioPath": "/home/username/android-studio/bin/studio.sh"
}
```

Open the project in Android Studio.

``` bash
npx cap open android
```